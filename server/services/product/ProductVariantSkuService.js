import BaseService from '../BaseService.js';
import ProductVariantSkuModel from '../../models/product/ProductVariantSkuModel.js';
import { makeArray } from '../../utils/index.js';
import StripeApi from '../StripeApi.js';


export default class ProductVariantSkuService extends BaseService {

    constructor() {
        super(new ProductVariantSkuModel());
    }


    async createStripePrice(knex, Sku, Product) {
        const stripePrice = await StripeApi.createPrice(
            knex,
            {
                unit_amount: Sku.display_price,
                'product_data[name]': `SKU:${Sku.id}`,  // (required) https://stripe.com/docs/api/prices/create#create_price-product_data-name
                // 'product_data[id]':  Sku.get('id'),  // https://stripe.com/docs/api/prices/create#create_price-product_data-id
                'product_data[metadata]': { sku: Sku.id },
                'product_data[tax_code]': Product.tax_code // https://stripe.com/docs/api/prices/create#create_price-product_data-tax_code
            }
        );

        if(stripePrice) {
            return this.update({
                knex: knex,
                data: {
                    stripe_price_id: stripePrice.id,
                    stripe_product_id: stripePrice.product
                },
                where: { id: Sku.id }
            });
        }
    }

    async createSku(knex, data, Product) {
        global.logger.info('REQUEST: ProductVariantSkuService.createSku', {
            meta: data
        });

        const Sku = await this.create({
            knex: knex,
            data: data
        });

        const UpdatedSku = await this.createStripePrice(knex, Sku, Product);

        global.logger.info('RESPONSE: ProductVariantSkuService.createSku', {
            meta: UpdatedSku
        });

        return UpdatedSku;
    }


    async updateSku(knex, data, Product) {
        global.logger.info('REQUEST: ProductVariantSkuService.updateSku', {
            meta: data
        });

        const OldSku = await this.fetchOne({
            knex: knex,
            where: { id: data.id }
        });

        let UpdatedSku = await this.update({
            knex: knex,
            data: data,
            where: { id: data.id }
        });

        let doArchive = false;
        let doCreate = false;
        if(OldSku) {
            // Note that mutating Prices in the API is extremely limited:
            // https://stripe.com/docs/api/prices/update
            // There was a lively discussion here about the inability to delete a price:
            // https://github.com/stripe/stripe-python/issues/658
            // The same logic applies that prohibits the ability to mutate prices.... once they have been
            // used in a product, they are essentially 'frozen'.

            // Therefore, we have to go through a tedious process of
            // - fetch the current SKU price
            // - compare it to the price being submitted here
            // - if different, then archive the current Stripe Price, and create a new one

            if(OldSku.display_price && !UpdatedSku.display_price) {
                doArchive = OldSku.stripe_price_id;
            }
            else if(OldSku.display_price !== UpdatedSku.display_price) {
                doArchive = OldSku.stripe_price_id;
                doCreate = true;
            }
        }
        else {
            doCreate = true;
        }

        if(doArchive) {
            StripeApi.archivePrice(knex, doArchive);
        }
        if(doCreate) {
            UpdatedSku = await this.createStripePrice(knex, UpdatedSku, Product);
        }

        global.logger.info('RESPONSE: ProductVariantSkuService.updateSku', {
            meta: UpdatedSku
        });

        return UpdatedSku;
    }


    async upsertMultiple(knex, skus, Product) {
        const promises = [];

        if(Array.isArray(skus)) {
            skus.forEach((sku) => {
                promises.push(
                    sku.id ? this.updateSku(knex, sku, Product) : this.createSku(knex, sku, Product)
                );
            });
        }

        return Promise.all(promises);
    }


    /**
     * Soft-delete a SKU
     * Note that SKUs are soft-deleted in order to maintain reporting
     * history for old Carts
     *
     * @param {*} knex
     * @param {*} id
     */
    async deleteSku(knex, id) {
        global.logger.info('REQUEST: ProductVariantSkuService.del', {
            meta: { id }
        });

        const Sku = await this.fetchOne({
            knex: knex,
            where: { id: id }
        });

        if(Sku) {
            const promises = [];

            if(Sku.stripe_price_id) {
                promises.push(
                    StripeApi.archivePrice(knex, Sku.stripe_price_id)
                );
            }

            if(Sku.stripe_product_id) {
                promises.push(
                    StripeApi.archiveProduct(knex, Sku.stripe_product_id)
                );
            }

            promises.push(
                this.del({
                    knex: knex,
                    where: { id: id }
                })
            );

            return Promise.all(promises);
        }
    }


    async deleteForVariant(knex, product_variant_id) {
        global.logger.info('REQUEST: ProductVariantSkuService.deleteForVariant', {
            meta: { product_variant_id }
        });

        const skus = await this.search({
            knex: knex,
            where: { product_variant_id: product_variant_id },
            paginate: false
        });

        const promises = [];

        makeArray(skus).forEach((sku) => {
            promises.push(
                this.deleteSku(knex, sku.id)
            )
        });

        return Promise.all(promises);
    }


    /**
     * Adds variant relation to a list of products
     *
     * @param {*} knex
     * @param {*} products
     * @returns []
     */
    async addSkuRelationsToVariants(knex, variants) {
        const variantMap = {};

        makeArray(variants).forEach((variant) => {
            if(variant.id) {
                variantMap[variant.id] = variant;
            }
        });

        const variantIds = Object.keys(variantMap);

        if(variantIds.length) {
            // Get all skus for the collection of variants
            const skus = await knex
                .select(this.model.getAllColumns())
                .from(this.model.tableName)
                .whereIn('product_variant_id', variantIds)
                .whereNull('deleted_at');

            this.addVirtuals(skus);

            skus.forEach(sku => {
                if(!Array.isArray(variantMap[sku.product_variant_id].skus)) {
                    variantMap[sku.product_variant_id].skus = [];
                }
                variantMap[sku.product_variant_id].skus.push(sku);
            });
        }
    }


    addVirtuals(data) {
        makeArray(data).forEach((sku) => {
            sku.display_price = (function(s) {
                if(s.is_on_sale && s.sale_price !== null) {
                    return s.sale_price;
                }

                return s.base_price;
            })(sku);
        });

        return data;
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.published = schema.published.default(false);
        schema.is_on_sale = schema.is_on_sale.default(false);
        schema.track_inventory_count = schema.track_inventory_count.default(true);
        schema.visible_if_no_inventory = schema.visible_if_no_inventory.default(true);

        return schema;
    }

}
