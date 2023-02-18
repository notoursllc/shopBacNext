import Joi from 'joi';
import BaseDao from './BaseDao.js';

export default class TenantMemberDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.tenant_members;
        this.hidden = [
            ...this.hidden,
            'password'
        ];
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
