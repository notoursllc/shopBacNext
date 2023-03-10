import Joi from 'joi';
import BaseDao from '../BaseDao.js';

export default class ProductCollectionDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.product_collections;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean(),
            name: Joi.string().max(100),
            value: Joi.number().integer().min(0),
            description: Joi.string().max(500).allow(null),
            image_url: Joi.string().max(200).allow(null),
            seo_page_title: Joi.string().max(200).allow(null),
            seo_page_desc: Joi.string().max(500).allow(null),
            seo_uri: Joi.string().max(100).allow(null),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }

}
