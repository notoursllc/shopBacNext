import MasterTypeModel from '../models/MasterTypeModel.js';
import BaseService from './BaseService.js';

export default class MasterTypeService extends BaseService {

    constructor() {
        super(new MasterTypeModel());
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.name = schema.name.required();
        schema.object = schema.object.required();

        return schema;
    }

}
