import Joi from 'joi';

export default class BaseService {

    constructor(dao) {
        this.dao = dao;
    }


    /**
     * A convenience method wrapper around dao.search
     * that also returns model relations unless declined
     * by config.fetchRelations = false
     *
     * @param {*} config
     */
    async search(config) {
        return config.knex.client.transaction(async trx => {
            const results = await this.dao.search({
                ...config,
                knex: trx
            });

            if(config.fetchRelations !== false) {
                // Unpaginated results return an array
                // Paginated results return an object with 'data' and 'pagination' props
                await this.addRelations(
                    trx,
                    Array.isArray(results) ? results : (results?.data || [])
                );
            }

            return results;
        });
    }


    /**
     * A convenience method wrapper around dao.fetchOne
     * that also returns model relations unless declined
     * by config.fetchRelations = false
     *
     * @param {*} config
     */
    async fetchOne(config) {
        return config.knex.client.transaction(async trx => {
            const result = await this.dao.fetchOne({
                ...config,
                knex: trx
            });

            if(result && config.fetchRelations !== false) {
                await this.addRelations(trx, result);
            }

            return result;
        });
    }


    /**
     * A convenience method wrapper around dao.upsertOne
     * that also returns model relations unless declined
     * by config.fetchRelations = false
     *
     * @param {*} config
     */
    async upsertOne(config) {
        const results = await this.dao.upsertOne(config);

        if(results && config.fetchRelations !== false) {
            await this.addRelations(config.knex, results);
        }

        return results;
    }


    async del(config) {
        return config.knex.transaction(async trx => {
            const Model = await this.fetchOne({
                ...config,
                knex: trx,
            });

            if(!Model) {
                throw new Error('Item does not exist');
            }

            await this.deleteRelations(trx, Model.id);

            return this.dao.del({
                knex: trx,
                where: { id: Model.id }
            });
        });
    }


    /*
    * This method is meant to be extended
    */
    addRelations(knex, results) {
        return results;
    }


    /*
    * This method is meant to be extended
    */
    deleteRelations(knex, id) {
        return;
    }


    getTenantIdFromAuth(request) {
        return request.auth?.credentials?.tenant_id;
    }


    getValidationSchemaForUpdate() {
        const schemaCopy = { ...this.dao.schema };
        schemaCopy.id = schemaCopy.id.required();

        delete schemaCopy.tenant_id;
        delete schemaCopy.created_at;
        delete schemaCopy.updated_at;
        delete schemaCopy.deleted_at;
        return schemaCopy;
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


    getValidationSchemaForSearch() {
        const schemaCopy = {
            ...this.dao.schema,
            ...this.getValidationSchemaForPagination()
        };
        delete schemaCopy.deleted_at;
        return schemaCopy;
    }


    getValidationSchemaForId() {
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
                        ...this.getValidationSchemaForId(),
                        ordinal: Joi.number().integer().required()
                    })
                ),
                Joi.string().trim()
            )
        }
    }

}
