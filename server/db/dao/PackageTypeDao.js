import Joi from 'joi';
import BaseDao from './BaseDao.js';


export default class PackageTypeDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.package_types;
        this.hidden = ['tenant_id', 'deleted_at'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            label: Joi.string().max(100).allow(null),
            description: Joi.alternatives().try(
                Joi.string().trim().max(500),
                Joi.allow(null)
            ),
            notes: Joi.alternatives().try(
                Joi.string().trim().max(500),
                Joi.allow(null)
            ),
            code: Joi.string().max(100).allow(null),
            code_for_carrier: Joi.string().max(100).allow(null),
            length_cm: Joi.number().min(0).allow(null),
            width_cm: Joi.number().min(0).allow(null),
            height_cm: Joi.number().min(0).allow(null),
            weight_oz: Joi.number().min(0).allow(null),
            max_weight_oz: Joi.number().min(0).allow(null),
            ordinal: Joi.number().integer().min(0).allow(null),
            published: Joi.boolean(),
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date()
        }
    }

}
