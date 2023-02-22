import tables from '../utils/tables.js';
import {
    getSql_grantSelect,
    getSql_grantSelectInsertUpdateDelete
} from '../utils/policies.js';

const tableName = tables.exchange_rates;

/*
* NOTE: this table data is not tied to a tenant_id
* so a RLS policy is not needed
*/

export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.integer('id', { primaryKey: true });
                t.string('base').nullable();
                t.jsonb('rates').nullable();
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();

                t.index([
                    'id'
                ]);
            }
        ),

        // knex.raw( getSql_grantSelect(tableName) )
        knex.raw( getSql_grantSelectInsertUpdateDelete(tableName) ),
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
