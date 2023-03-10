
import BaseService from '../BaseService.js';
import ProductCollectionDao from '../../db/dao/product/ProductCollectionDao.js';

export default class ProductCollectionService extends BaseService {

    constructor() {
        super(new ProductCollectionDao());
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.published = schema.published.default(false);
        schema.name = schema.name.required();
        schema.value = schema.value.required();
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = { ...super.getValidationSchemaForUpdate() };
        schema.published = schema.published.default(false);
        schema.name = schema.name.required();
        schema.value = schema.value.required();
        return schema;
    }

}
