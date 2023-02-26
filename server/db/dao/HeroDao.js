import Joi from 'joi';
import BaseDao from './BaseDao.js';


export default class HeroDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.heros;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid().allow(null),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean().default(true),
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

}
