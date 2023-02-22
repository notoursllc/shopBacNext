import Joi from 'joi';
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
        return this.hidden.includes('deleted_at')
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



    async search(knex, query, columns) {
        try {
            const qb = knex
                .select(columns || this.getAllColumns())
                .from(this.tableName);

            this.buildFilters(query, qb);

            if(this.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            const response = await this.paginate(query, qb);
            return response;
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    async fetchOne(knex, whereConfig, columns) {
        try {
            const qb = knex
                .select(Array.isArray(columns) ? columns : this.getAllColumns())
                .from(this.tableName)
                .where(whereConfig);

            if(this.schema.deleted_at) {
                qb.whereNull('deleted_at')
            }

            const response = await qb.first();
            return response;
        }
        catch(err) {
            console.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    /*
    * Deletes a record
    * http://knexjs.org/#Builder-del%20/%20delete
    */
    async del(knex, whereObj) {
        try {
            const qb = knex
                .from(this.tableName)
                .returning('id')
                .where(whereObj);

            const returnObj = { id: null };

            if(this.isSoftDelete()) {
                const updateResponse = await qb.whereNull('deleted_at').update({
                    deleted_at: knex.fn.now()
                });

                returnObj.id = updateResponse?.[0]?.id || null;
            }
            else {
                // or hard delete
                const delResponse = await qb.del();
                returnObj.id = delResponse?.[0]?.id || null;
            }

            return returnObj;
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    async update(config) {
        assertKnex(config);
        assertWhere(config);
        assertData(config);

        try {
            const knex = config.knex;
            const payload = {...config.data};
            delete payload.id;
            payload.updated_at = knex.fn.now();

            const qb = knex(this.tableName)
                .returning(config.returning || this.getAllColumns())
                .where(config.where);

            if(this.isSoftDelete()) {
                qb.whereNull('deleted_at')
            }

            // awaiting the reponse will cause errors to be caught
            // in the catch block.  Otherwise the errors will be returned,
            // which may lead DB query info
            const response = await qb.update(payload);
            return response[0];
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    tenantUpdate(config) {
        assertKnex(config);
        assertData(config);

        try {
            if(this.tableName !== this.tables.tenants) {
                config.data.tenant_id = config.knex.tenant_id;
            }

            return this.update(config);
        }
        catch(err) {
            global.logger.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    async create(knex, data) {
        try {
            // awaiting the reponse will cause errors to be caught
            // in the catch block.  Otherwise the errors will be returned,
            // which may lead DB query info
            const response = await knex
                .returning(this.getAllColumns())
                .insert(data)
                .into(this.tableName);

            return response;
        }
        catch(err) {
            console.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
    }


    tenantCreate(knex, data) {
        try {
            const payload = {...data};
            payload.tenant_id = knex.tenant_id;

            return this.create(knex, payload);
        }
        catch(err) {
            console.error(err);
            throw new Error(GERNERIC_ERROR_MSG);
        }
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


    sanitize(results) {
        const arr = Array.isArray(results) ? results : [results];

        const clean = arr.map((obj) => {
            this.hidden.forEach((key) => {
                delete obj[key];
            });
            return obj;
        });

        return clean;
    }


    stripInvalidCols(data) {
        const cols = this.getAllColumns();
        const validData = {};

        for(const key in data) {
            if(cols.includes(key)) {
                validData[key] = data[key];
            }
        }

        return validData;
    }


    prepareForUpsert(data) {
        const doClean = (obj) => {
            const d = { ...this.upsertFormat(obj) };
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


    async addRelations(parentResults, childQuery, parentResultKey, childResultKey, relationName) {
        const whereInArray = [];
        const data = makeArray(parentResults)

        data.forEach(result => {
            if(result.hasOwnProperty(parentResultKey) && result[parentResultKey] !== null) {
                whereInArray.push( result[parentResultKey] );
            }
        });

        const relations = await childQuery.whereIn(childResultKey, whereInArray);

        data.map((row) => {
            row[relationName] = relations.filter((r) => r[childResultKey] === row[parentResultKey])
            return row;
        });

        return data;
    }


    getPaginationSchema() {
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

}
