import Joi from 'joi';

export default class BaseService {

    constructor(dao) {
        this.dao = dao;
    }


    getTenantIdFromAuth(request) {
        return request.auth?.credentials?.tenant_id;
    }


    getValidationSchemaForUpdate() {
        const schemaCopy = { ...this.dao.schema };
        delete schemaCopy.tenant_id;
        delete schemaCopy.created_at;
        delete schemaCopy.updated_at;
        delete schemaCopy.deleted_at;
        return schemaCopy;
    }


    getValidationSchemaForAdd() {
        const schemaCopy = this.getValidationSchemaForUpdate();
        delete schemaCopy.id;
        return schemaCopy;
    }


    getIdValidationSchema() {
        return {
            id: Joi.string().uuid().required()
        }
    }


    getValidationSchemaForPagination() {
        return {
            _sort: Joi.string().max(50),

            _pageSize: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.string().max(5)
            ),

            _page: Joi.alternatives().try(
                Joi.number().integer().min(0),
                Joi.string().max(5)
            )
        };
    }


    getValidationSchemaForUpdateOrdinals() {
        return {
            ordinals: Joi.alternatives().try(
                Joi.array().items(
                    Joi.object().keys({
                        ...this.getIdValidationSchema(),
                        ordinal: Joi.number().integer().required()
                    })
                ),
                Joi.string().trim()
            )
        }
    }

}
