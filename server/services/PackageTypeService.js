import Joi from 'joi';
import PackageTypeModel from '../models/PackageTypeModel.js';
import BaseService from './BaseService.js';

export default class PackageTypeService extends BaseService {

    constructor() {
        super(new PackageTypeModel());
    }


    getUpdateOrdinalsValidationSchema() {
        return {
            // ordinals: Joi.array().items(
            //     Joi.object().keys({
            //         ...this.getValidationSchemaForId(),
            //         ordinal: Joi.number().integer().required()
            //     })
            // )
            ordinals: Joi.alternatives().try(
                Joi.array().items(
                    Joi.object().keys({
                        ...this.getValidationSchemaForId(),
                        ordinal: Joi.number().integer().required()
                    })
                ),
                Joi.string().trim()
            )
        }
    }

}
