const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectInsertUpdate
} = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.cart_items;

module.exports.up = (knex) => {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary();
                t.uuid('tenant_id').nullable();
                t.integer('qty').nullable();
                t.jsonb('product').nullable();
                t.jsonb('product_variant').nullable();
                t.jsonb('product_variant_sku').nullable();
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();
                t.timestamp('deleted_at', true).nullable();
                t.timestamp('fulfilled_at', true).nullable();

                // Foreign Keys:
                t.uuid('cart_id')
                    .notNullable()
                    .references('id')
                    .inTable(DB_TABLES.carts);

                t.index([
                    'id',
                    'cart_id'
                ]);
            }
        ),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),
        knex.raw( getSql_createPolicyEnableSelectBasedOnId(tableName) ),
        knex.raw( getSql_grantSelectInsertUpdate(tableName) )
    ]);
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(tableName);
};
