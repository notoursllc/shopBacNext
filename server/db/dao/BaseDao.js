import { assert }from '@hapi/hoek';
import tables from '../utils/tables.js';
import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import isFunction from 'lodash.isfunction';
import { makeArray } from '../../utils/index.js';

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

export default class BaseDao {

    constructor() {
        this.tableName = null;
        this.schema = {};
        this.hidden = ['tenant_id', 'deleted_at'];
        this.tables = tables;
    }


    getSchema() {
        return this.schema;
    }


    isSoftDelete() {
        return this.schema.hasOwnProperty('deleted_at');
    }


    getAllColumns(includeHiddenCols) {
        let keys = Object.keys(this.schema);

        if(!includeHiddenCols) {
            keys = keys.filter(key => !this.hidden.includes(key))
        }

        // using a Set will de-dupe the column names
        const colNameSet = new Set(keys);
        return Array.from(colNameSet);
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
    * }
    */
    async search(config) {
        assertKnex(config);

        try {
            const knex = config.knex;

            const qb = knex
                .select(config.columns || this.getAllColumns())
                .from(this.tableName);

            if(config.where) {
                this.buildFilters(config.where, qb);
            }

            // Dont interfere with the deleted_at query if the user
            // has specified it in the config.where
            if(!config.where?.deleted_at && this.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            let response;
            if(config.paginate !== false) {
                response = await this.paginate(config.where, qb);
                this.addVirtuals(response.data);
            }
            else {
                response = await qb;
                this.addVirtuals(response);
            }

            return response;
        }
        catch(err) {
            console.log("ERROR", err)
            // global.logger.error(err);
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
            const knex = config.knex;

            const qb = knex
                .select(config.columns || this.getAllColumns())
                .from(this.tableName);

            if(config.where) {
                qb.where(config.where);
            }

            if(!config.where?.hasOwnProperty('deleted_at') && this.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            const response = await qb.first();

            this.addVirtuals(response);

            return response;
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
    *   data: required
    *   columns: optional
    * }
    */
    async create(config) {
        assertKnex(config);
        assertData(config);

        try {
            const knex = config.knex;

            const payload = this.prepareForUpsert(config.data);
            if(this.tableName !== this.tables.tenants && this.schema.hasOwnProperty('tenant_id')) {
                payload.tenant_id = knex.userParams.tenant_id;
            }

            // awaiting the reponse will cause errors to be caught
            // in the catch block.  Otherwise the errors will be returned,
            // which may lead DB query info
            const response = await knex
                .returning(config.columns || this.getAllColumns())
                .insert(payload)
                .into(this.tableName);

            this.addVirtuals(response);

            return Array.isArray(config.data) ? response : response[0];
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

            if(this.tableName !== this.tables.tenants && this.schema.hasOwnProperty('tenant_id')) {
                payload.tenant_id = knex.userParams.tenant_id;
            }

            const qb = knex(this.tableName)
                .returning(config.columns || this.getAllColumns())
                .where(config.where);

            // Dont allow soft-deleted rows to be updated
            if(this.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            const response = await qb.update(payload);

            this.addVirtuals(response);

            return Array.isArray(config.data) ? response : response[0];
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /**
     * Creates or Updates a DB record
     *
     * Config: {
     *   knex: required
     *   data: required
     *   where: optional
     *   columns: optional
     * }
     */
    async upsertOne(config) {
        assertKnex(config);
        assertData(config);

        if(config.data.id) {
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
            const knex = config.knex;

            const qb = knex
                .from(this.tableName)
                .returning(config.columns || 'id')
                .where(config.where);

            let dbResponse;

            if(this.isSoftDelete()) {
                dbResponse = await qb.whereNull('deleted_at').update({
                    deleted_at: knex.fn.now()
                });
            }
            else {
                dbResponse = await qb.del();
            }

            return dbResponse?.[0] || {};
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


    parseQuery(query) {
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
     * https://knexjs.org/#Builder-wheres
     */
    buildFilters(query, qb) {
        if(!query) {
            return;
        }

        // const parsed = qs.parse(query);
        this.parseQuery(query);

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


    paginate(params, qb) {
        return qb.paginate({
            perPage: params?._pageSize || 100,
            currentPage: params?._page || 1
        });
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
    async addRelations(parentResults, parentResultKey, childQuery, childResultKey, relationName, oneToOne = false) {
        const whereInArray = [];
        const data = makeArray(parentResults)

        data.forEach(result => {
            if(result.hasOwnProperty(parentResultKey) && result[parentResultKey] !== null) {
                whereInArray.push( result[parentResultKey] );
            }
        });

        const relations = await childQuery.whereIn(childResultKey, whereInArray);

        data.map((row) => {
            const filteredRelations = relations.filter((r) => r[childResultKey] === row[parentResultKey]);
            row[relationName] = oneToOne
                ? (filteredRelations?.[0] || null)
                : filteredRelations;

            return row;
        });

        return data;
    }

}
