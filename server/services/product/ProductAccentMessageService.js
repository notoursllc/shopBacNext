
import BaseService from '../BaseService.js';
import ProductAccentMessageModel from '../../models/product/ProductAccentMessageModel.js';

export default class ProductAccentMessageService extends BaseService {

    constructor() {
        super(new ProductAccentMessageModel());
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.message = schema.message.required();

        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = { ...super.getValidationSchemaForUpdate() };
        schema.message = schema.message.required();

        return schema;
    }

}
