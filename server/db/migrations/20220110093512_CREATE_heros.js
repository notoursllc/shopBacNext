const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectInsertUpdate
} = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.heros;

exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary();
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(true);
                t.string('title').nullable();
                t.text('caption').nullable();
                t.integer('ordinal').nullable().defaultTo(1);
                t.string('url').nullable();
                t.string('alt_text').nullable();
                t.jsonb('metadata').nullable();

                // TIMESTAMPS
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
        knex.raw( getSql_grantSelectInsertUpdate(tableName) )
    ]);
};


exports.down = function(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
