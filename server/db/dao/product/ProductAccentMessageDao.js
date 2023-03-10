import Joi from 'joi';
import BaseDao from '../BaseDao.js';


export default class ProductAccentMessageDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.product_accent_messages;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            message: Joi.string().max(100),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }

}
