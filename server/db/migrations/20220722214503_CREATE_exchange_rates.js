const {
    DB_TABLES,
    getSql_grantSelect,
 } = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.exchange_rates;

/*
* NOTE: this table data is not tied to a tenant_id
* so a RLS policy is not needed
*/

exports.up = function(knex) {
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

        knex.raw( getSql_grantSelect(tableName) )
    ]);
};


exports.down = function(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
