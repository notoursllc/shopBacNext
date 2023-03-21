import Joi from 'joi';
import BaseModel from '../BaseModel.js';

function getJoiStringOrNull(strLen) {
    return Joi.alternatives().try(
        Joi.string().trim().max(strLen || 100),
        Joi.allow(null)
    );
}

export default class CartModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.carts;
        this.hidden = ['tenant_id', 'deleted_at'];

        this.shippingAddressSchema = {
            shipping_firstName: getJoiStringOrNull(),
            shipping_lastName: getJoiStringOrNull(),
            shipping_company: getJoiStringOrNull(),
            shipping_streetAddress: getJoiStringOrNull(),
            shipping_extendedAddress: getJoiStringOrNull(),
            shipping_city: getJoiStringOrNull(),
            shipping_state: getJoiStringOrNull(),
            shipping_postalCode: getJoiStringOrNull(),
            shipping_countryCodeAlpha2: getJoiStringOrNull(2),
            shipping_phone: getJoiStringOrNull(),
            shipping_email: Joi.alternatives().try(
                Joi.string().email().max(50).label('Shipping: Email'),
                Joi.allow(null)
            )
        },

        this.schema = {
            id: Joi.string().uuid().allow(null),
            tenant_id: Joi.string().uuid(),
            billing_firstName: getJoiStringOrNull(),
            billing_lastName: getJoiStringOrNull(),
            billing_company: getJoiStringOrNull(),
            billing_streetAddress: getJoiStringOrNull(),
            billing_extendedAddress: getJoiStringOrNull(),
            billing_city: getJoiStringOrNull(),
            billing_state: getJoiStringOrNull(),
            billing_postalCode: getJoiStringOrNull(),
            billing_countryCodeAlpha2: getJoiStringOrNull(2),
            billing_phone: getJoiStringOrNull(),
            billing_same_as_shipping: Joi.boolean(),
            ...this.shippingAddressSchema,
            currency: Joi.alternatives().try(
                Joi.string().empty(''),
                Joi.allow(null)
            ),
            currency_exchange_rate: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null)
            ),
            selected_shipping_rate: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            shipping_rate_quote: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            shipping_label: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            tax_nexus_applied: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            stripe_payment_intent_id: getJoiStringOrNull(),
            stripe_order_id: getJoiStringOrNull(),
            sales_tax: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.allow(null)
            ),
            is_gift: Joi.boolean(),
            admin_order_notes: Joi.alternatives().try(
                Joi.array(),
                Joi.allow(null)
            ),
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date(),
            closed_at: Joi.date(),
            shipped_at: Joi.date()
        }
    }

}
