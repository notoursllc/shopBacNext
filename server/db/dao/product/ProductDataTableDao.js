 import Joi from 'joi';
import BaseDao from '../BaseDao.js';

export default class ProductDataTableDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.product_data_tables;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            name: Joi.string().max(100),
            table_data: Joi.object().allow(null),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }

}
