const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectInsertUpdateDelete
} = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.product_accent_messages;

module.exports.up = (knex) => {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary();
                t.uuid('tenant_id').nullable();
                t.string('message').nullable();
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();

                t.index([
                    'id',
                    'tenant_id'
                ]);
            }
        ),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),
        knex.raw( getSql_createPolicyEnableSelectBasedOnId(tableName) ),
        knex.raw( getSql_grantSelectInsertUpdateDelete(tableName) )
    ]);
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(tableName);
};
