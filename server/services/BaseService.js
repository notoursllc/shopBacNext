import Joi from 'joi';

export default class BaseService {

    constructor(dao) {
        this.dao = dao;
    }


    getTenantIdFromAuth(request) {
        return request.auth?.credentials?.tenant_id;
    }


    getValidationSchemaForAdd() {
        const schemaCopy = { ...this.dao.schema };
        delete schemaCopy.id;
        delete schemaCopy.tenant_id;
        delete schemaCopy.created_at;
        delete schemaCopy.updated_at;
        delete schemaCopy.deleted_at;
        return schemaCopy;
    }


    getIdValidationSchema() {
        return {
            id: Joi.string().uuid().required()
        }
    }

}
