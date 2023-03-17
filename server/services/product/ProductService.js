import Joi from 'joi';
import cloneDeep from 'lodash.clonedeep';
import BaseService from '../BaseService.js';
import ProductDao from '../../db/dao/product/ProductDao.js';
import ProductArtistService from './ProductArtistService.js';
import ProductVariantService from './ProductVariantService.js';

export default class ProductService extends BaseService {

    constructor() {
        super(new ProductDao());
        this.ProductArtistService = new ProductArtistService();
        this.ProductVariantService = new ProductVariantService();
    }


    async getProducts(knex, query, paginate) {
        return knex.client.transaction(async trx => {
            const products = await this.dao.search({
                knex: trx,
                where: query,
                paginate: paginate
            });

            if(products?.data.length) {
                await this.addRelations(trx, products.data);
            }

            return products;
        });
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

            const Product = await this.dao.upsertOne({
                knex: trx,
                data: prodData
            });

            if(Product) {
                await this.ProductVariantService.upsertMultiple(trx, variants, Product)
                const UpdatedProduct = await this.dao.fetchOne({
                    knex: trx,
                    where: { id: Product.id }
                });
                await this.addRelations(trx, UpdatedProduct);
                return UpdatedProduct;
            }
        });
    }


    async del(knex, id) {
        global.logger.info('REQUEST: ProductService.del', {
            meta: { id }
        });

        return knex.transaction(async trx => {
            return Promise.all([
                this.ProductVariantService.deleteForProduct(trx, id),
                this.dao.del({
                    knex: trx,
                    where: { id: id }
                })
            ]);
        });
    }


    async getProduct(knex, id) {
        return knex.client.transaction(async trx => {
            const product = await this.dao.fetchOne({
                knex: trx,
                where: { id }
            });

            if(product) {
                await this.addRelations(trx, product);
            }

            return product;
        });
    }


    addRelations(knex, products) {
        return Promise.all([
            this.ProductVariantService.addRelationToProducts(knex, products),
            this.ProductArtistService.addRelationToProducts(knex, products)
        ]);
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
        const productSchema = this.dao.schema

        return {
            published: productSchema.published,
            sub_type: productSchema.sub_type,
            ...this.getValidationSchemaForPagination()
        };
    }

}
