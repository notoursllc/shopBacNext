const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectInsertUpdateDelete
 } = require('../../plugins/core/services/CoreService');


const tableName = DB_TABLES.master_types;

module.exports.up = (knex) => {

    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary();
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(true);
                t.string('object').nullable();
                t.string('name').notNullable();
                t.integer('value').nullable();
                t.string('slug').nullable();
                t.string('description').nullable();
                t.json('metadata').nullable();
                t.integer('ordinal').nullable().defaultTo(1);
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

        knex.raw( getSql_grantSelectInsertUpdateDelete(tableName) ),
    ]);

};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(tableName);
};
