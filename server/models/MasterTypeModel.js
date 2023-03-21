import Joi from 'joi';
import BaseModel from './BaseModel.js';

export default class MasterTypeModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.master_types;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean(),
            published: Joi.boolean(),
            object: Joi.string().max(100),
            name: Joi.string().max(100),
            value: Joi.number().integer().min(0),
            slug: Joi.string().allow('').allow(null),
            description: Joi.string().max(500).allow('').allow(null),
            // metadata: Joi.array().allow(null),
            metadata: Joi.alternatives().try(
                Joi.array(),
                Joi.string(),
                Joi.allow(null)
            ),
            ordinal: Joi.number().integer().min(0).allow(null),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }


    // formatForUpsert(data) {
    //     if (data.metadata) {
    //         data.metadata = JSON.stringify(data.metadata)
    //     }

    //     return data;
    // }

}
