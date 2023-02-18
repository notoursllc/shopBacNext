const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectInsertUpdate
 } = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.product_artists;

module.exports.up = (knex) => {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary();
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(true);
                t.boolean('is_global').defaultTo(true);
                t.string('name').notNullable();
                t.text('description').nullable();
                t.string('website').notNullable();
                t.string('city').nullable();
                t.string('state').nullable();
                t.string('countryCodeAlpha2', 2).nullable();
                t.string('image').nullable();
                t.string('alt_text').nullable();
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();
                t.timestamp('deleted_at', true).nullable();

                t.index([
                    'id',
                    'tenant_id'
                ]);
            }
        ),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),

        knex.raw( getSql_createPolicyEnableSelectBasedOnId(tableName) ),

        knex.raw( getSql_grantSelectInsertUpdate(tableName) ),
    ]);
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(tableName);
};
