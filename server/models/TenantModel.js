import Joi from 'joi';
import BaseModel from './BaseModel.js';

function getJoiStringOrNull(strLen) {
    return Joi.alternatives().try(
        Joi.string().trim().max(strLen || 100),
        Joi.allow(null)
    );
}


export default class TenantModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.tenants;
        this.hidden = [];
        this.schema = {
            id: Joi.string().max(100).required(),
            auth_password: getJoiStringOrNull(),
            application_name: getJoiStringOrNull(),
            application_url: getJoiStringOrNull(250),
            application_logo: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.object(),
                Joi.allow(null)
            ),
            stripe_key: getJoiStringOrNull(),
            shipengine_api_key: getJoiStringOrNull(),
            shipengine_carriers: Joi.alternatives().try(
                Joi.string().trim(),
                Joi.allow(null)
            ),
            // shipengine_carriers: Joi.array().allow(null),
            shipping_from_name: getJoiStringOrNull(),
            shipping_from_streetAddress: getJoiStringOrNull(),
            shipping_from_extendedAddress: getJoiStringOrNull(),
            shipping_from_company: getJoiStringOrNull(),
            shipping_from_city: getJoiStringOrNull(),
            shipping_from_state: getJoiStringOrNull(),
            shipping_from_postalCode: getJoiStringOrNull(),
            shipping_from_countryCodeAlpha2: getJoiStringOrNull(2),
            shipping_from_phone: getJoiStringOrNull(),
            // supported_currencies: Joi.array().allow(null),
            supported_currencies: Joi.alternatives().try(
                Joi.string().trim(),
                Joi.allow(null)
            ),
            default_currency: getJoiStringOrNull(),
            order_details_page_url: getJoiStringOrNull(250),
            active: Joi.boolean(),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }


    getValidationSchemaForAdd() {
        const schema = {
            ...super.getValidationSchemaForAdd()
        }
        schema.active = schema.active.default(true);
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = {
            ...super.getValidationSchemaForUpdate()
        }
        schema.active = schema.active.default(true);
        return schema;
    }

}
