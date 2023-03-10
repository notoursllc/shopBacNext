import BaseService from '../BaseService.js';
import ProductVariantSkuDao from '../../db/dao/product/ProductVariantSkuDao.js';
import { makeArray } from '../../utils/index.js';
import StripeService from '../StripeService.js';


export default class ProductVariantSkuService extends BaseService {

    constructor() {
        super(new ProductVariantSkuDao());
        this.StripeService = new StripeService();
    }


    async createStripePrice(knex, Sku, Product) {
        const stripePrice = await this.StripeService.createPrice(
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
            return this.dao.update({
                knex: knex,
                data: {
                    stripe_price_id: stripePrice.id,
                    stripe_product_id: stripePrice.product
                },
                where: { id: Sku.id }
            });
        }
    }

    async create(knex, data, Product) {
        global.logger.info('REQUEST: ProductVariantSkuService.create', {
            meta: data
        });

        const Sku = await this.dao.create({
            knex: knex,
            data: data
        });

        const UpdatedSku = await this.createStripePrice(knex, Sku, Product);

        global.logger.info('RESPONSE: ProductVariantSkuService.create', {
            meta: UpdatedSku
        });

        return UpdatedSku;
    }


    async update(knex, data, Product) {
        global.logger.info('REQUEST: ProductVariantSkuService.update', {
            meta: data
        });

        const OldSku = await this.dao.fetchOne({
            knex: knex,
            where: { id: data.id }
        });

        let UpdatedSku = await this.dao.update({
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
            this.StripeService.archivePrice(knex, doArchive);
        }
        if(doCreate) {
            UpdatedSku = await this.createStripePrice(knex, UpdatedSku, Product);
        }

        global.logger.info('RESPONSE: ProductVariantSkuService.update', {
            meta: UpdatedSku
        });

        return UpdatedSku;
    }


    async upsertMultiple(knex, skus, Product) {
        const promises = [];

        if(Array.isArray(skus)) {
            skus.forEach((sku) => {
                promises.push(
                    sku.id ? this.update(knex, sku, Product) : this.create(knex, sku, Product)
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
    async del(knex, id) {
        global.logger.info('REQUEST: ProductVariantSkuService.del', {
            meta: { id }
        });

        const Sku = await this.dao.fetchOne({
            knex: knex,
            where: { id: id }
        });

        if(Sku) {
            const promises = [];

            if(Sku.stripe_price_id) {
                promises.push(
                    this.StripeService.archivePrice(knex, Sku.stripe_price_id)
                );
            }

            if(Sku.stripe_product_id) {
                promises.push(
                    this.StripeService.archiveProduct(knex, Sku.stripe_product_id)
                );
            }

            promises.push(
                this.dao.del({
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

        const skus = await this.dao.search({
            knex: knex,
            where: { product_variant_id: product_variant_id },
            paginate: false
        });

        const promises = [];

        makeArray(skus).forEach((sku) => {
            promises.push(
                this.del(knex, sku.id)
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
                .select(this.dao.getAllColumns())
                .from(this.dao.tableName)
                .whereIn('product_variant_id', variantIds)
                .whereNull('deleted_at');

            this.dao.addVirtuals(skus);

            skus.forEach(sku => {
                if(!Array.isArray(variantMap[sku.product_variant_id].skus)) {
                    variantMap[sku.product_variant_id].skus = [];
                }
                variantMap[sku.product_variant_id].skus.push(sku);
            });
        }
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
