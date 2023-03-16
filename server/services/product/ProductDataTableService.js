
import BaseService from '../BaseService.js';
import ProductDataTableDao from '../../db/dao/product/ProductDataTableDao.js';

export default class ProductDataTableService extends BaseService {

    constructor() {
        super(new ProductDataTableDao());
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.name = schema.name.required();
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = { ...super.getValidationSchemaForUpdate() };
        schema.name = schema.name.required();
        return schema;
    }

}
