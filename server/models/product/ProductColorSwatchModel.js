import Joi from 'joi';
import BaseModel from '../BaseModel.js';

export default class ProductColorSwatchModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.product_color_swatches;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            hex: Joi.string().max(10),
            label: Joi.string().max(50),
            description: Joi.alternatives().try(
                Joi.string().max(255),
                Joi.allow(null)
            ),
            metadata: Joi.alternatives().try(
                Joi.array(),
                Joi.allow(null)
            ),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }

}
