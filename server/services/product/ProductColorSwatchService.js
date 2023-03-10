
import BaseService from '../BaseService.js';
import ProductColorSwatchDao from '../../db/dao/product/ProductColorSwatchDao.js';

export default class ProductColorSwatchService extends BaseService {

    constructor() {
        super(new ProductColorSwatchDao());
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.hex = schema.hex.required();
        schema.label = schema.label.required();
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = { ...super.getValidationSchemaForUpdate() };
        schema.hex = schema.hex.required();
        schema.label = schema.label.required();
        return schema;
    }

}
