import Joi from 'joi';
import PackageTypeDao from '../db/dao/PackageTypeDao.js';
import BaseService from './BaseService.js';

export default class PackageTypeService extends BaseService {

    constructor() {
        super(new PackageTypeDao());
    }


    getSinglePackageTypeValidationSchema() {
        return {
            id: Joi.string().uuid().required()
        }
    }

}
