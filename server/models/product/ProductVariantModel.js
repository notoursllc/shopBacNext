import Joi from 'joi';
import BaseModel from '../BaseModel.js';
import { makeArray } from '../../utils/index.js';

export default class ProductVariantModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.product_variants;
        this.hidden = ['tenant_id', 'deleted_at'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean().empty(''),
            ordinal: Joi.number().integer().min(0),
            label: Joi.alternatives().try(
                Joi.string().max(100),
                Joi.allow(null)
            ),
            basic_color_type: Joi.alternatives().try(
                Joi.number().integer().positive(),
                Joi.allow(null)
            ),
            sku_label_type: Joi.alternatives().try(
                Joi.string().max(100),
                Joi.allow(null)
            ),

            // PRICING
            currency: Joi.alternatives().try(
                Joi.string().max(3),
                Joi.allow(null)
            ),

            is_taxable: Joi.boolean().empty(''),
            tax_code: Joi.alternatives().try(
                Joi.number(),
                Joi.allow(null)
            ),

            // ACCENT MESSAGE
            accent_message_id: Joi.alternatives().try(
                Joi.string().uuid(),
                Joi.allow(null)
            ),
            accent_message_begin: Joi.alternatives().try(
                Joi.date(),
                Joi.allow(null)
            ),
            accent_message_end: Joi.alternatives().try(
                Joi.date(),
                Joi.allow(null)
            ),

            // MEDIA
            images: Joi.alternatives().try(
                Joi.string().empty(''),
                Joi.allow(null)
            ),
            swatches: Joi.alternatives().try(
                Joi.array().items(
                    Joi.object().keys({
                        label: Joi.string(),
                        swatch: Joi.string()
                    })
                ),
                // Joi.string().empty(''),
                Joi.allow(null)
            ),

            // SHIPPING
            customs_country_of_origin: Joi.alternatives().try(
                Joi.string().max(2),
                Joi.allow(null)
            ),

            product_id: Joi.string().uuid(),

            // TIMESTAMPS
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date()
        }
    }


    formatForUpsert(data) {
        if (data.swatches) {
            data.swatches = JSON.stringify(data.swatches)
        }

        return data;
    }

}
