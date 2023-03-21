
import BaseService from '../BaseService.js';
import ProductDataTableModel from '../../models/product/ProductDataTableModel.js';

export default class ProductDataTableService extends BaseService {

    constructor() {
        super(new ProductDataTableModel());
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
