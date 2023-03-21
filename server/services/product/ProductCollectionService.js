
import BaseService from '../BaseService.js';
import ProductCollectionModel from '../../models/product/ProductCollectionModel.js';

export default class ProductCollectionService extends BaseService {

    constructor() {
        super(new ProductCollectionModel());
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
