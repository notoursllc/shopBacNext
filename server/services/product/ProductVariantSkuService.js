
import BaseService from '../BaseService.js';
import ProductVariantSkuDao from '../../db/dao/product/ProductVariantSkuDao.js';
import { makeArray } from '../../utils/index.js';


export default class ProductVariantSkuService extends BaseService {

    constructor() {
        super(new ProductVariantSkuDao());
    }


    /**
     * Adds variant relation to a list of products
     *
     * @param {*} knex
     * @param {*} products
     * @returns []
     */
    async addSkuRelationsToVariants(knex, products) {
        const productVariantMap = {};

        makeArray(products).forEach(prod => {
            if(Array.isArray(prod.variants)) {
                prod.variants.forEach(v => {
                    if(v.id) {
                        productVariantMap[v.id] = v;
                    }
                });
            }
        });

        const variantIds = Object.keys(productVariantMap);

        if(variantIds.length) {
            // Get all skus for the collection of variants
            const skus = await knex
                .select(this.dao.getAllColumns())
                .from(this.dao.tableName)
                .whereIn('product_variant_id', variantIds)
                .whereNull('deleted_at');

            skus.forEach(sku => {
                if(!Array.isArray(productVariantMap[sku.product_variant_id].skus)) {
                    productVariantMap[sku.product_variant_id].skus = [];
                }
                productVariantMap[sku.product_variant_id].skus.push(sku);
            });
        }

        return this.addVirtuals(products);
    }


    addVirtuals(products) {
        makeArray(products).forEach((product) => {
            makeArray(product.variants).forEach((variant) => {
                makeArray(variant.skus).forEach((sku) => {
                    // display price
                    sku.display_price = (function(s) {
                        if(s.is_on_sale && s.sale_price !== null) {
                            return s.sale_price;
                        }

                        return s.base_price;
                    })(sku)
                });
            });
        });

        return products;
    }

}
