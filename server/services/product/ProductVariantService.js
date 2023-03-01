
import BaseService from '../BaseService.js';
import ProductVariantDao from '../../db/dao/product/ProductVariantDao.js';
import ProductVariantSkuService from './ProductVariantSkuService.js'
import { makeArray } from '../../utils/index.js';

export default class ProductVariantService extends BaseService {

    constructor() {
        super(new ProductVariantDao());
        this.ProductVariantSkuService = new ProductVariantSkuService();
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

        return this.addVirtuals(products);
    }


    addVirtuals(products) {
        makeArray(products).forEach((product) => {
            makeArray(product.variants).forEach((variant) => {
                // total_inventory_count
                variant.total_inventory_count = (function(v) {
                    let totalCount = 0;

                    makeArray(v.skus).forEach((obj) => {
                        totalCount += (obj.inventory_count || 0);
                    });

                    return totalCount;
                })(variant);
            });
        });

        return products;
    }

}
