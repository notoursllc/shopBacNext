import Joi from 'joi';
import BaseModel from '../BaseModel.js';
import { makeArray } from '../../utils/index.js';

const joiPositiveNumberOrNull = Joi.alternatives().try(
    Joi.number().integer().positive(),
    Joi.allow(null)
);


export default class ProductModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.products;
        this.hidden = ['tenant_id', 'deleted_at'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean(),
            title: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            caption: Joi.alternatives().try(
                Joi.string().trim().max(200),
                Joi.allow(null)
            ),
            description: Joi.alternatives().try(
                Joi.string().trim().max(2000),
                Joi.allow(null)
            ),
            copyright: Joi.alternatives().try(
                Joi.string().trim().max(200),
                Joi.allow(null)
            ),
            is_good: Joi.boolean(),

            // these should be stringified values in the payload:
            metadata: Joi.alternatives().try(
                Joi.array(),
                Joi.allow(null)
            ),

            // TYPES
            type: joiPositiveNumberOrNull,
            sub_type: joiPositiveNumberOrNull,
            sales_channel_type: joiPositiveNumberOrNull,
            package_type: joiPositiveNumberOrNull,
            vendor_type: joiPositiveNumberOrNull,
            collections: joiPositiveNumberOrNull,
            gender_type: joiPositiveNumberOrNull,
            fit_type: joiPositiveNumberOrNull,
            sleeve_length_type: joiPositiveNumberOrNull,
            feature_type: joiPositiveNumberOrNull,

            // SEO
            seo_page_title: Joi.alternatives().try(
                Joi.string().trim().max(70),
                Joi.allow(null)
            ),
            seo_page_desc: Joi.alternatives().try(
                Joi.string().trim().max(320),
                Joi.allow(null)
            ),
            seo_uri: Joi.alternatives().try(
                Joi.string().trim().max(50),
                Joi.allow(null)
            ),

            // MEDIA
            // images: Joi.array().allow(null),
            youtube_video_url: Joi.string().trim().max(500).empty('').allow(null).default(null),
            video: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),

            // SHIPPING
            shippable: Joi.boolean().empty(''),
            customs_country_of_origin: Joi.alternatives().try(
                Joi.string().max(2),
                Joi.allow(null)
            ),
            customs_harmonized_system_code: Joi.alternatives().try(
                Joi.string(),
                Joi.allow(null)
            ),

            // PACKAGING
            ship_alone: Joi.boolean().empty(''),
            packing_length_cm: joiPositiveNumberOrNull,
            packing_width_cm: joiPositiveNumberOrNull,
            packing_height_cm: joiPositiveNumberOrNull,

            tax_code: Joi.alternatives().try(
                Joi.string().trim().max(50),
                Joi.allow(null)
            ),

            product_artist_id: Joi.alternatives().try(
                Joi.string().uuid(),
                Joi.allow(null)
            ),

            // TIMESTAMPS
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date(),
        }
    }




}
