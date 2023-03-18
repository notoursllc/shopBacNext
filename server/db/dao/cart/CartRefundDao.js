import Joi from 'joi';
import BaseDao from '../BaseDao.js';


export default class CartDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.cart_refunds;
        this.hidden = ['tenant_id', 'deleted_at'];
        this.schema = {
            id: Joi.string().uuid().allow(null),
            tenant_id: Joi.string().uuid(),
            cart_id: Joi.string().uuid(),
            subtotal_refund: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null)
            ),
            shipping_refund: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null)
            ),
            tax_refund: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null)
            ),
            description: Joi.alternatives().try(
                Joi.string().trim().max(500),
                Joi.allow(null)
            ),
            reason: Joi.alternatives().try(
                Joi.string().max(50),
                Joi.allow(null)
            ),
            stripe_refund_id: Joi.alternatives().try(
                Joi.string().max(50),
                Joi.allow(null)
            ),
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date()
        }
    }

}
