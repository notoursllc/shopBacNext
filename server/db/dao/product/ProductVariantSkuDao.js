import Joi from 'joi';
import BaseDao from '../BaseDao.js';
import { makeArray } from '../../../utils/index.js';

export default class ProductVariantSkuDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.product_variant_skus;
        this.hidden = ['tenant_id', 'deleted_at'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean().empty(''),
            ordinal: Joi.number().integer().min(0).allow(null),
            label: Joi.alternatives().try(
                Joi.string().max(100),
                Joi.allow(null)
            ),
            sku: Joi.alternatives().try(
                Joi.string().max(100),
                Joi.allow(null)
            ),
            barcode: Joi.alternatives().try(
                Joi.string().max(100),
                Joi.allow(null)
            ),

            // PRICING
            base_price: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null),
                Joi.allow('')
            ),
            compare_at_price: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null),
                Joi.allow('')
            ),
            cost_price: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null),
                Joi.allow('')
            ),
            sale_price: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null),
                Joi.allow('')
            ),
            is_on_sale: Joi.boolean().empty(''),

            // SHIPPING
            weight_oz: Joi.alternatives().try(
                Joi.number().precision(2).min(0).max(99999999.99),
                Joi.allow(null)
            ),
            customs_country_of_origin: Joi.alternatives().try(
                Joi.string().max(2),
                Joi.allow(null),
                Joi.allow('')
            ),

            // INVENTORY
            inventory_count: Joi.number().integer().min(0).empty('').default(0),
            track_inventory_count: Joi.boolean().empty('').default(true),
            visible_if_no_inventory: Joi.boolean().empty('').default(true),
            product_variant_id: Joi.string().uuid(),

            // STRIPE
            stripe_price_id: Joi.string(),
            stripe_product_id: Joi.string(),

            // TIMESTAMPS
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date()
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

}
