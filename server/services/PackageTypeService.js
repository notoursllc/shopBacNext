import Joi from 'joi';
import PackageTypeModel from '../models/PackageTypeModel.js';
import BaseService from './BaseService.js';
import { makeArray } from '../utils/index.js';

export default class PackageTypeService extends BaseService {

    constructor() {
        super(new PackageTypeModel());
    }


    addVirtuals(data) {
        makeArray(data).forEach((PackageType) => {
            PackageType.volume_cm = (function(obj) {
                const val = parseFloat(obj.length_cm || 0, 2)
                    * parseFloat(obj.width_cm || 0, 2)
                    * parseFloat(obj.height_cm || 0, 2);

                return val.toFixed(2);
            })(PackageType);
        });

        return data;
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
