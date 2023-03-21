import Joi from 'joi';
import BaseModel from './BaseModel.js';

export default class TenantMemberModel extends BaseModel {

    constructor() {
        super();
        this.tableName = this.tables.tenant_members;
        this.hidden = ['tenant_id', 'password'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().max(100),
            email: Joi.string().max(100),
            password: Joi.string().max(100),
            active: Joi.boolean(),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }

}
