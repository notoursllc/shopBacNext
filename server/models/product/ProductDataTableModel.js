 import Joi from 'joi';
import BaseModel from '../BaseModel.js';

export default class ProductDataTableModel extends BaseModel {

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
