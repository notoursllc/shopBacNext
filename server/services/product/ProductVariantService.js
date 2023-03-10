
import Joi from 'joi';
import cloneDeep from 'lodash.clonedeep';
import isString from 'lodash.isstring';
import BaseService from '../BaseService.js';
import ProductVariantDao from '../../db/dao/product/ProductVariantDao.js';
import ProductVariantSkuService from './ProductVariantSkuService.js'
import { makeArray } from '../../utils/index.js';
import BunnyAPI from '../BunnyAPI.js';

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


    async del(knex, id) {
        global.logger.info('REQUEST: ProductVariantService.del', {
            meta: { id }
        });

        return Promise.all([
            this.ProductVariantSkuService.deleteForVariant(knex, id),
            this.dao.del({
                knex: knex,
                where: { id: id }
            })
        ]);
    }


    /**
     * Soft deletes a ProductVariant
     * Note that Product Variants are soft-deleted in order to maintain reporting
     * history for old Carts.
     * Images are not physically deleted either
     *
     * @param {*} knex
     * @param {*} product_id
     */
    async deleteForProduct(knex, product_id) {
        global.logger.info('REQUEST: ProductVariantService.deleteForProduct', {
            meta: { product_id }
        });

        // await this.addRelationToProducts(knex, Product);
        const ProductVariants = await this.dao.search({
            knex: knex,
            where: { product_id: product_id },
            paginate: false
        });

        const promises = [];
        makeArray(ProductVariants).forEach((Variant) => {
            promises.push(
                this.del(knex, Variant.id)
            )
        });

        return Promise.all(promises);
    }


    async deleteImage(knex, variantId, mediaId) {
        global.logger.info('REQUEST: ProductVariantService.deleteImage', {
            meta: { variantId, mediaId }
        });

        const Variant = await this.dao.fetchOne({
            knex: knex,
            where: { id: variantId }
        });

        if(Variant) {
            if(Array.isArray(Variant.images)) {
                let matchedIndex = null;

                Variant.images.forEach((obj, index) => {
                    if(obj.id === mediaId) {
                        matchedIndex = index;
                    }
                })

                if(matchedIndex !== null) {
                    // Delete the image file.
                    // Any errors here should only be logged
                    // so they don't affect the outcome of this operation
                    try {
                        BunnyAPI.storage.del(Variant.images[matchedIndex].url);
                    }
                    catch(err) {
                        global.logger.error(err);
                        global.bugsnag(err);
                    }

                    // Take the matched index out of the images array
                    Variant.images.splice(matchedIndex, 1);

                    return this.dao.update({
                        knex: knex,
                        where: { id: variantId },
                        data: { images: Variant.images }
                    });
                }
            }
        }
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

        const prodArray = makeArray(products);
        for(let i=0, l=prodArray.length; i<l; i++) {
            await this.ProductVariantSkuService.addSkuRelationsToVariants(knex, prodArray[i].variants);
            this.dao.addVirtuals(prodArray[i].variants);
        }

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
