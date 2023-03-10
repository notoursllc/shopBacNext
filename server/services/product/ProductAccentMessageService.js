
import BaseService from '../BaseService.js';
import ProductAccentMessageDao from '../../db/dao/product/ProductAccentMessageDao.js';

export default class ProductAccentMessageService extends BaseService {

    constructor() {
        super(new ProductAccentMessageDao());
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
