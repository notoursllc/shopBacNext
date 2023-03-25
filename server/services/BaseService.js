import Joi from 'joi';
import { assert }from '@hapi/hoek';
import isFunction from 'lodash.isfunction';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import { makeArray } from '../utils/index.js';

const GERNERIC_ERROR_MSG = 'An error occurred while executing the DB operation.';

function assertKnex(config) {
    assert(isFunction(config.knex), new Error('config.knex must be a function'));
}

function assertWhere(config) {
    assert(isObject(config.where), new Error('config.where must be an object'));
}

function assertData(config) {
    assert(isObject(config.data), new Error('config.data must be an object'));
}


export default class BaseService {

    constructor(model) {
        this.model = model;
    }


    /**
    * Searches DB records
    *
    * Config: {
    *   knex: required
    *   where: optional
    *   data: N/A
    *   columns: optional
    *   paginate: optional (default true)
    *   orderBy: optional
    * }
    *
    * @example orderBy: ['id:DESC']
    * @example orderBy: ['id:DESC', 'foo:ASC']
    */
    async search(config) {
        assertKnex(config);

        try {
            const knex = config.knex;

            const qb = knex
                .select(config.columns || this.model.getAllColumns())
                .from(this.model.tableName);

            if(config.where) {
                this.buildFilters(config.where, qb);
            }

            // Dont interfere with the deleted_at query if the user
            // has specified it in the config.where
            if(!config.where?.deleted_at && this.model.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            // order by:
            makeArray(config.orderBy).forEach((str) => {
                const pair = str.split(':').map(val => val.trim());

                if(pair.length === 2
                    && ['asc', 'desc'].includes( pair[1].toLowerCase() )
                    && this.model.getAllColumns().includes(pair[0])) {
                        qb.orderBy(pair[0], pair[1].toLowerCase())
                }
            });

            const results = config.paginate !== false
                ? await qb.paginate({ perPage: config.where?._pageSize || 100, currentPage: config.where?._page || 1 })
                : await qb;

            if(config.fetchRelations !== false) {
                // Unpaginated results return an array
                // Paginated results return an object with 'data' and 'pagination' props
                await this.addRelations(
                    config.knex,
                    Array.isArray(results) ? results : (results?.data || [])
                );
            }

            this.addVirtuals(
                Array.isArray(results) ? results : (results?.data || [])
            );

            return results;
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /**
    * Gets one DB record
    *
    * Config: {
    *   knex: required
    *   where: optional
    *   data: N/A
    *   columns: optional
    * }
    */
    async fetchOne(config) {
        assertKnex(config);

        try {
            const qb = config.knex
                .select(config.columns || this.model.getAllColumns())
                .from(this.model.tableName);

            if(config.where) {
                this.buildFilters(config.where, qb);
            }

            if(!config.where?.hasOwnProperty('deleted_at') && this.model.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            const results = await qb.first();

            if(config.fetchRelations !== false) {
                await this.addRelations(config.knex, results);
            }

            this.addVirtuals(results);

            return results;
        }
        catch(err) {
            console.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /**
    * Creates a DB record
    *
    * Config: {
    *   knex: required
    *   where: N/A
    *   data: optional
    *   columns: optional
    * }
    *
    * NOTE: config.data is optional because I realized there is a use case
    * for only inserting the tenant_id in the row, which is when a new Cart is created.
    */
    async create(config) {
        assertKnex(config);

        try {
            const payload = config.data ? this.prepareForUpsert(config.data) : {};

            this.addTenantIdToPayload(config.knex, payload);
            delete payload.id;

            // awaiting the reponse will cause errors to be caught
            // in the catch block.  Otherwise the errors will be returned,
            // which may lead DB query info
            const results = await config.knex
                .returning(config.columns || this.model.getAllColumns())
                .insert(payload)
                .into(this.model.tableName);

            if(results && config.fetchRelations !== false) {
                await this.addRelations(config.knex, results);
            }

            this.addVirtuals(results);

            return Array.isArray(config.data) ? results : results[0];
        }
        catch(err) {
            console.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /**
    * Updates a DB record
    *
    * Config: {
    *   knex: required
    *   where: required
    *   data: required
    *   columns: optional
    * }
    */
    async update(config) {
        assertKnex(config);
        assertWhere(config);
        assertData(config);

        try {
            const knex = config.knex;

            const payload = this.prepareForUpsert(config.data);
            delete payload.id;
            payload.updated_at = knex.fn.now();

            this.addTenantIdToPayload(knex, payload);

            const qb = knex(this.model.tableName)
                .returning(config.columns || this.model.getAllColumns())
                .where(config.where);

            // Dont allow soft-deleted rows to be updated
            if(this.model.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            const results = await qb.update(payload);

            if(results && config.fetchRelations !== false) {
                await this.addRelations(knex, results);
            }

            this.addVirtuals(results);

            return Array.isArray(config.data) ? results : results[0];
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /**
     * Creates or Updates a DB record
     */
    upsertOne(config) {
        if(config.data?.id) {
            return this.update({
                ...config,
                where: {
                    id: config.data.id,
                    ...config.where
                }
            })
        }

        return this.create(config);
    }


    /*
    * Deletes a DB record
    * http://knexjs.org/#Builder-del%20/%20delete
    *
    * Config: {
    *   knex: required
    *   where: required
    *   columns: optional
    * }
    */
    async del(config) {
        assertKnex(config);
        assertWhere(config);

        try {
            const Model = await this.fetchOne(config);
            if(!Model) {
                throw new Error('Model does not exist');
            }

            const knex = config.knex;

            return knex.transaction(async trx => {
                await this.deleteRelations(trx, Model.id);

                const qb = trx
                    .from(this.model.tableName)
                    .returning(config.columns || 'id')
                    .where(config.where);

                const dbResponse = this.model.isSoftDelete()
                    ? await qb.whereNull('deleted_at').update({ deleted_at: knex.fn.now() })
                    : await qb.del();

                return dbResponse?.[0] || {};
            });
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /*
    * This method is meant to be extended
    */
    addVirtuals(data) {
        return data;
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


    /**
     * This method is meant to be extended by any class
     * that has specific data formatting needs before DB insertion
     *
     * @param {*} data
     * @returns
     */
    formatForUpsert(data) {
        return data;
    }


    addTenantIdToPayload(knex, payload) {
        if(this.model.tableName !== this.model.tables.tenants && this.model.schema.hasOwnProperty('tenant_id')) {
            payload.tenant_id = knex.userParams.tenant_id;
        }
    }


    prepareForUpsert(data) {
        const doClean = (obj) => {
            const d = { ...this.formatForUpsert(obj) };
            delete d.created_at;
            delete d.updated_at;
            delete d.deleted_at;

            return d;
        }

        if(Array.isArray(data)) {
            return data.map((obj) => doClean(obj));
        }

        return doClean(data);
    }


    /**
     * For every parentResult, find all relations
     *
     * @param {*} parentResults
     * @param {*} childQuery
     * @param {*} parentResultKey
     * @param {*} childResultKey
     * @param {*} relationName
     *
     * @returns []
     */
    async setRelations(parentResults, parentResultKey, childQuery, childResultKey, relationName, oneToOne = false) {
        const whereInSet = new Set();  // use a Set so dupes are not collected
        const data = makeArray(parentResults)

        data.forEach(result => {
            if(result.hasOwnProperty(parentResultKey) && result[parentResultKey] !== null) {
                whereInSet.add( result[parentResultKey] );
            }
        });

        const relations = await childQuery.whereIn(childResultKey, Array.from(whereInSet));

        data.map((row) => {
            const filteredRelations = relations.filter((r) => r[childResultKey] === row[parentResultKey]);
            row[relationName] = oneToOne
                ? (filteredRelations?.[0] || null)
                : filteredRelations;

            return row;
        });

        return data;
    }


    /**
     * This pattern was inspired by: https://strapi.oschina.io/documentation/v3.x/content-api/parameters.html#available-operators
     * Knex query builder cheat sheet:  https://devhints.io/knex
     *
     * No suffix or eq: Equals
     * ne: Not equals
     * lt: Less than
     * gt: Greater than
     * lte: Less than or equal to
     * gte: Greater than or equal to
     * in: Included in an array of values
     * nin: Isn't included in an array of values
     * like: %like%
     * null: Is null/Is not null
     *
     * @example query values:
     * { 'id': { 'ne': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } }
     * { 'id': 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } => same as 'eq'
     * { 'closed_at': { 'null' : false } }  => 'closed_at is not null'
     * { 'closed_at': { 'null' : true } }  => 'closed_at is null'
     * { 'sub_type': { 'bitwise_and_gt': {'left':2, 'right':0} } }
     *
     *
     * https://knexjs.org/#Builder-wheres
     */
    buildFilters(query, qb) {
        if(!query) {
            return;
        }

        if(isObject(query)) {
            for(let key in query) {
                const orig = query[key];

                try {
                    if(isString(query[key])) {
                        query[key] = JSON.parse(query[key]);
                    }
                }
                catch(err) {
                    query[key] = orig
                }
            }
        }

        const operators = {
            eq: 'eq',
            ne: 'ne',
            lt: 'lt',
            gt: 'gt',
            lte: 'lte',
            gte: 'gte',
            in: 'in',
            nin: 'nin',
            like: 'like',
            null: 'null',
            bitwise_and_gt: 'bitwise_and_gt'
        }

        const blacklist = [
            '_pageSize',
            '_page',
            '_sort',
            '_withRelated'
        ];

        let whereUsed = false;

        const addWhere = (prop, operator, value) => {
            if(!whereUsed) {
                qb.where(prop, operator, value);
                whereUsed = true;
            }
            else {
                qb.andWhere(prop, operator, value);
            }
        }

        const trimArray = (arr) => {
            const clean = [];

            arr.forEach((item) => {
                const trimmed = item.trim();
                if(trimmed) {
                    clean.push(trimmed)
                }
            });

            return clean;
        }

        for(let prop in query) {
            let operator = operators.eq;
            let propValue = query[prop];

            // an operator modifier is an object
            // with only one key, which is one of the
            // keys in 'operators'
            if(isObject(query[prop])) {
                const keys = Object.keys(query[prop]);

                if(keys.length === 1 && operators.hasOwnProperty(keys[0])) {
                    operator = keys[0];
                    propValue = query[prop][operator];
                }
            }

            if(!blacklist.includes(prop)) {
                switch(operator) {
                    case operators.eq:
                        addWhere(prop, '=', propValue)
                        break;

                    case operators.ne:
                        addWhere(prop, '!=', propValue)
                        break;

                    case operators.lt:
                        addWhere(prop, '<', propValue)
                        break;

                    case operators.gt:
                        addWhere(prop, '>', propValue)
                        break;

                    case operators.lte:
                        addWhere(prop, '<=', propValue)
                        break;

                    case operators.gte:
                        addWhere(prop, '>=', propValue)
                        break;

                    case operators.in:
                        qb.whereIn(prop, trimArray(propValue));
                        break;

                    case operators.nin:
                        qb.whereNotIn(prop, trimArray(propValue));
                        break;

                    case operators.like:
                        addWhere(prop, 'LIKE', propValue);
                        break;

                    case operators.null:
                        if(propValue === 'true' || propValue === true) {
                            qb.whereNull(prop);
                        }
                        else {
                            qb.whereNotNull(prop);
                        }
                        break;

                    case operators.bitwise_and_gt:
                        // qb.whereRaw(`${prop} & ? > 0`, [propValue])
                        qb.whereRaw(`${prop} & ? > ${parseFloat(propValue.right)}`, [propValue.left])
                        break;

                    case operators.jsonb:
                        qb.whereRaw(`?? @> ?::jsonb`, [
                            prop,
                            (isObject(propValue) || Array.isArray(propValue) ? JSON.stringify(propValue) : propValue)
                        ])
                        break;
                }
            }
        }
    }


    /**
     * Just a convenience method to get the tenant_id value
     * because I always forget the name of the 'userParams' object
     *
     * @param {*} knex
     * @returns
     */
    getTenantIdFromKnex(knex) {
        return knex.userParams.tenant_id;
    }


    getValidationSchemaForUpdate() {
        const schemaCopy = { ...this.model.schema };
        schemaCopy.id = schemaCopy.id.required();

        delete schemaCopy.tenant_id;
        delete schemaCopy.created_at;
        delete schemaCopy.updated_at;
        delete schemaCopy.deleted_at;
        return schemaCopy;
    }


    getValidationSchemaForAdd() {
        const schemaCopy = { ...this.model.schema };

        delete schemaCopy.id;
        delete schemaCopy.tenant_id;
        delete schemaCopy.created_at;
        delete schemaCopy.updated_at;
        delete schemaCopy.deleted_at;

        return schemaCopy;
    }


    getValidationSchemaForSearch() {
        const schemaCopy = {
            ...this.model.schema,
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
