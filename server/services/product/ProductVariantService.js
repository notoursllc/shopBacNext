
import Joi from 'joi';
import cloneDeep from 'lodash.clonedeep';
import isString from 'lodash.isstring';
import BaseService from '../BaseService.js';
import ProductVariantDao from '../../db/dao/product/ProductVariantDao.js';
import ProductVariantSkuService from './ProductVariantSkuService.js'
import { makeArray } from '../../utils/index.js';

export default class ProductVariantService extends BaseService {

    constructor() {
        super(new ProductVariantDao());
        this.ProductVariantSkuService = new ProductVariantSkuService();
    }


    async upsert(knex, data, Product) {
        global.logger.info('REQUEST: ProductVariantService.upsert', {
            meta: data
        });

        const dataCopy = cloneDeep(data);
        dataCopy.product_id = Product.id;
        delete dataCopy.skus;

        const daoConfig = {
            knex: knex,
            data: dataCopy
        }

        let ProductVariant;
        if(dataCopy.id) {
            ProductVariant = await this.dao.update({
                ...daoConfig,
                where: { id: dataCopy.id }
            });
        }
        else {
            ProductVariant = await this.dao.create(daoConfig);
        }

        data.skus?.forEach((sku) => {
            sku.product_variant_id = ProductVariant.id;
        })

        return this.ProductVariantSkuService.upsertMultiple(knex, data.skus, Product);
    }


    upsertMultiple(knex, variants, Product) {
        const promises = [];

        let parsedVariants;
        try {
            if(isString(variants)) {
                parsedVariants = JSON.parse(variants);
            }
        }
        catch(err) {
            global.logger.error('UNABLE TO PARSE VARIANTS', { meta: err } );
        }

        if(Product && Array.isArray(parsedVariants)) {
            parsedVariants.forEach((variantData) => {
                promises.push(
                    this.upsert(knex, variantData, Product)
                );
            });
        }

        return Promise.all(promises);
    }


    /**
     * Adds variant relation to a list of products
     *
     * @param {*} knex
     * @param {*} products
     * @returns []
     */
    async addRelationToProducts(knex, products) {
        await this.dao.addRelations(
            products,
            'id',
            knex.select(this.dao.getAllColumns()).from(this.dao.tableName).whereNull('deleted_at'),
            'product_id',
            'variants'
        );

        await this.ProductVariantSkuService.addSkuRelationsToVariants(knex, products);

        makeArray(products).forEach((product) => {
            this.dao.addVirtuals(product.variants);
        })

        return products;
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.published = schema.published.default(false);
        schema.skus = Joi.alternatives().try(
            Joi.allow(null),
            Joi.array().items(
                Joi.object(this.ProductVariantSkuService.getValidationSchemaForAdd())
            )
        );

        return schema;
    }

}
