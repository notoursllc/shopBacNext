import Joi from 'joi';
import cloneDeep from 'lodash.clonedeep';
import BaseService from '../BaseService.js';
import ProductModel from '../../models/product/ProductModel.js';
import ProductArtistService from './ProductArtistService.js';
import ProductVariantService from './ProductVariantService.js';
import { makeArray } from '../../utils/index.js';

export default class ProductService extends BaseService {

    constructor() {
        super(new ProductModel());
        this.ProductArtistService = new ProductArtistService();
        this.ProductVariantService = new ProductVariantService();
    }


    async upsert(knex, data) {
        global.logger.info('REQUEST: ProductService.upsert', {
            meta: data
        });

        // return knex.client.transaction(async trx => {
        return knex.transaction(async trx => {
            const prodData = { ...data };
            const variants = cloneDeep(prodData.variants);
            delete prodData.variants;

            const Product = await this.upsertOne({
                knex: trx,
                data: prodData
            });

            if(Product) {
                await this.ProductVariantService.upsertMultiple(trx, variants, Product)
                const UpdatedProduct = await this.fetchOne({
                    knex: trx,
                    where: { id: Product.id }
                });
                return UpdatedProduct;
            }
        });
    }


    addVirtuals(products) {
        makeArray(products).forEach((prod) => {
            // packing_volume_cm
            prod.packing_volume_cm = (prod.packing_length_cm || 0)
                * (prod.packing_width_cm || 0)
                * (prod.packing_height_cm || 0);

            // total_inventory_count
            prod.total_inventory_count = (function(p) {
                let totalCount = 0;

                // https://bookshelfjs.org/api.html#Collection-instance-toArray
                makeArray(p.variants).forEach((obj) => {
                    totalCount += obj.total_inventory_count || 0;
                })

                return totalCount;
            })(prod);
        });

        return products;
    }


    addRelations(knex, products) {
        return Promise.all([
            this.ProductVariantService.addVariantsRelationToProducts(knex, products),
            this.ProductArtistService.addRelationToProducts(knex, products)
        ]);
    }


    deleteRelations(knex, id) {
        return this.ProductVariantService.deleteForProduct(knex, id);
    }


    formatForUpsert(data) {
        if (data.metadata) {
            data.metadata = JSON.stringify(data.metadata)
        }

        if (data.video) {
            data.video = JSON.stringify(data.video)
        }

        return data;
    }


    setUpsertSchemaAdditions(schema) {
        schema.published = schema.published.default(false);
        schema.is_good = schema.is_good.default(true);
        schema.variants = Joi.alternatives().try(
            Joi.allow(null),
            Joi.array().items(
                Joi.object(this.ProductVariantService.getValidationSchemaForAdd())
            )
        );
    }


    getValidationSchemaForAdd() {
        const schema = super.getValidationSchemaForAdd()
        this.setUpsertSchemaAdditions(schema);
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = super.getValidationSchemaForUpdate();
        this.setUpsertSchemaAdditions(schema);
        return schema;
    }


    getValidationSchemaForSearch() {
        return {
            published: this.model.schema.published,
            sub_type: this.model.schema.sub_type,
            ...this.getValidationSchemaForPagination()
        };
    }

}
