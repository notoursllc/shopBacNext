import Joi from 'joi';
import cloneDeep from 'lodash.clonedeep';
import BaseService from '../BaseService.js';
import ProductDao from '../../db/dao/product/ProductDao.js';
import ProductArtistService from './ProductArtistService.js';
import ProductVariantService from './ProductVariantService.js';
import { makeArray } from '../../utils/index.js';


export default class ProductService extends BaseService {

    constructor() {
        super(new ProductDao());
        this.ProductArtistService = new ProductArtistService();
        this.ProductVariantService = new ProductVariantService();
    }


    async getProducts(knex, query) {
        return knex.client.transaction(async trx => {
            const products = await this.dao.search({
                knex: trx,
                where: query
            });

            if(products?.data.length) {
                await Promise.all([
                    this.ProductVariantService.addRelationToProducts(trx, products.data),
                    this.ProductArtistService.addRelationToProducts(trx, products.data)
                ]);

                this.addVirtuals(products.data);
            }

            return products;
        });
    }


    async create(knex, data) {
        // return knex.client.transaction(async trx => {
        return knex.transaction(async trx => {
            const prodData = { ...data };
            const variants = cloneDeep(prodData.variants);
            delete prodData.variants;
            // prodData.tenant_id = knex.tenant_id;

            console.log("PROD DATA", prodData)
            console.log("TRX", trx)
            console.log("knex", knex)

            const response = await this.dao.create({
                knex: trx,
                data: prodData
            });

            // Upload the video and update the product
            // if(data.video?.path) {
            //     const uploadResponse = await BunnyAPI.video.upload(data.video.path);
            //     if(uploadResponse?.directPlayUrl) {
            //         this.dao.update({
            //             knex: trx,
            //             data: { video: uploadResponse.directPlayUrl },
            //             where: { id: response.id }
            //         });
            //     }
            // }



            // TODO: create variants
            if(response && variants) {

            }


        });
    }


    async getProduct(knex, id) {
        return knex.client.transaction(async trx => {
            const product = await this.dao.fetchOne({
                knex: trx,
                where: { id }
            });

            if(product) {
                await Promise.all([
                    this.ProductVariantService.addRelationToProducts(trx, product),
                    this.ProductArtistService.addRelationToProducts(trx, product)
                ]);

                this.addVirtuals(product);
            }

            return product;
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
                const variants = makeArray(p.variants);
                if(variants.length) {
                    variants.forEach((obj) => {
                        totalCount += obj.total_inventory_count || 0;
                    })
                }

                return totalCount;
            })(prod);
        });

        return products;
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.published = schema.published.default(false);
        schema.is_good = schema.is_good.default(true);
        schema.variants = Joi.alternatives().try(
            Joi.allow(null),
            Joi.array().items(
                Joi.object(this.ProductVariantService.getValidationSchemaForAdd())
            )
        )

        return schema;
    }


    getValidationSchemaForSearch() {
        const productSchema = this.dao.schema

        return {
            published: productSchema.published,
            sub_type: productSchema.sub_type,
            ...this.getValidationSchemaForPagination()
        };
    }

}
