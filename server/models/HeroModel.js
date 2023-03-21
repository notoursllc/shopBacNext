import Joi from 'joi';
import BaseModel from './BaseModel.js';


export default class HeroModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.heros;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid().allow(null),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean(),
            title: Joi.string(),
            caption: Joi.string(),
            ordinal: Joi.number().integer().min(0).allow(null),
            url: Joi.string().max(200).allow(null),
            alt_text: Joi.string().max(100).allow(null),
            metadata: Joi.alternatives().try(Joi.array(), Joi.allow(null)),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }


    getValidationSchemaForAdd() {
        const schema = {
            ...super.getValidationSchemaForAdd()
        }
        schema.published = schema.published.default(true);
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = {
            ...super.getValidationSchemaForUpdate()
        }
        schema.published = schema.published.default(true);
        return schema;
    }

}
