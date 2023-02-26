import Joi from 'joi';
import BaseDao from './BaseDao.js';

export default class MediaDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.media;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid().allow(null),
            tenant_id: Joi.string().uuid(),
            resource_type: Joi.string().allow(null),
            alt_text: Joi.string().max(100).allow(null),
            ordinal: Joi.number().integer().min(0).allow(null),
            url: Joi.string().max(200).allow(null),
            third_party_id: Joi.string().max(200).allow(null),
            created_at: Joi.date(),
            updated_at: Joi.date(),
        }
    }

}
