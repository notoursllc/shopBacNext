import Joi from 'joi';
import BaseModel from '../BaseModel.js';

export default class CartItemModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.cart_items;
        this.hidden = ['tenant_id', 'deleted_at'];
        this.schema = {
            id: Joi.string().uuid().allow(null),
            tenant_id: Joi.string().uuid(),
            qty: Joi.alternatives().try(
                Joi.number().integer().min(0)
            ),
            cart_id: Joi.alternatives().try(
                Joi.string().uuid(),
                Joi.allow(null)
            ),
            product: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            product_variant: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            product_variant_sku: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            fulfilled_at: Joi.date(),
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date()
        }
    }

}
