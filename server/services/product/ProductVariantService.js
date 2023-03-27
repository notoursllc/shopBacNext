
import Joi from 'joi';
import cloneDeep from 'lodash.clonedeep';
import isString from 'lodash.isstring';
import BaseService from '../BaseService.js';
import ProductVariantModel from '../../models/product/ProductVariantModel.js';
import ProductVariantSkuService from './ProductVariantSkuService.js'
import { makeArray } from '../../utils/index.js';
import BunnyAPI from '../BunnyAPI.js';

export default class ProductVariantService extends BaseService {

    constructor() {
        super(new ProductVariantModel());
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
            ProductVariant = await this.update({
                ...daoConfig,
                where: { id: dataCopy.id }
            });
        }
        else {
            ProductVariant = await this.create(daoConfig);
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


    deleteRelations(knex, id) {
        return this.ProductVariantSkuService.deleteForVariant(knex, id);
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

        const ProductVariants = await this.search({
            knex: knex,
            where: { product_id: product_id }
        });

        const promises = [];
        makeArray(ProductVariants).forEach((Variant) => {
            promises.push(
                this.del({
                    knex: knex,
                    where: { id: Variant.id }
                })
            )
        });

        return Promise.all(promises);
    }


    async deleteImage(knex, variantId, mediaId) {
        global.logger.info('REQUEST: ProductVariantService.deleteImage', {
            meta: { variantId, mediaId }
        });

        const Variant = await this.fetchOne({
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

                    return this.update({
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
    async addVariantsRelationToProducts(knex, products) {
        await this.setRelations(
            products,
            'id',
            knex.select(this.model.getAllColumns()).from(this.model.tableName).whereNull('deleted_at'),
            'product_id',
            'variants'
        );

        const prodArray = makeArray(products);
        for(let i=0, l=prodArray.length; i<l; i++) {
            await this.ProductVariantSkuService.addSkuRelationsToVariants(knex, prodArray[i].variants);
            this.addVirtuals(prodArray[i].variants);
        }

        return products;
    }


    addVirtuals(data) {
        makeArray(data).forEach((variant) => {
            variant.total_inventory_count = (function(v) {
                let totalCount = 0;

                makeArray(v.skus).forEach((obj) => {
                    totalCount += (obj.inventory_count || 0);
                });

                return totalCount;
            })(variant);
        });

        return data;
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


    getValidationSchemaForDelete() {
        return {
            ...this.getValidationSchemaForId(),
            media_id: Joi.string().uuid().required()
        }
    }

}
