import Joi from 'joi';
import MasterTypeDao from '../db/dao/MasterTypeDao.js';
import BaseService from './BaseService.js';

export default class MasterTypeService extends BaseService {

    constructor() {
        super(new MasterTypeDao());
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.name = schema.name.required();
        schema.object = schema.object.required();

        return schema;
    }

    getValidationSchemaForUpdate() {
        return {
            ...this.getIdValidationSchema(),
            ...super.getValidationSchemaForAdd()
        };
    }


    getValidationSchemaForUpdateOrdinals() {
        return {
            ordinals: Joi.alternatives().try(
                Joi.array().items(
                    Joi.object().keys({
                        ...this.getIdValidationSchema(),
                        ordinal: Joi.number().integer().required()
                    })
                ),
                Joi.string().trim()
            )
        }
    }

}
