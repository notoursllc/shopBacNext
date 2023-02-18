const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectInsertUpdate
} = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.package_types;

exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary();
                t.uuid('tenant_id').nullable();
                t.string('label').nullable();
                t.text('description').nullable();
                t.text('notes').nullable();
                t.string('code').nullable();
                t.string('code_for_carrier').nullable();
                t.float('length_cm').nullable();
                t.float('width_cm').nullable();
                t.float('height_cm').nullable();
                t.float('weight_oz').nullable();
                t.float('max_weight_oz').nullable();
                t.integer('ordinal').nullable().defaultTo(1);
                t.boolean('published').defaultTo(true);
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
