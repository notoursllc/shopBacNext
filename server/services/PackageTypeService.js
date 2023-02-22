import Joi from 'joi';
import PackageTypeDao from '../db/dao/PackageTypeDao.js';
import BaseService from './BaseService.js';

export default class PackageTypeService extends BaseService {

    constructor() {
        super(new PackageTypeDao());
    }


    getUpdateOrdinalsValidationSchema() {
        return {
            // ordinals: Joi.array().items(
            //     Joi.object().keys({
            //         ...this.getIdValidationSchema(),
            //         ordinal: Joi.number().integer().required()
            //     })
            // )
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
