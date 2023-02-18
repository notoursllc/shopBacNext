const {
    DB_TABLES,
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnId,
    getSql_grantSelectUpdate
 } = require('../../plugins/core/services/CoreService');

const tableName = DB_TABLES.tenants;


module.exports.up = async (knex) => {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.string('api_key').nullable();
                t.string('api_key_public').nullable();
                t.string('application_name').nullable();
                t.string('application_url').nullable();
                t.text('application_logo').nullable();
                t.string('stripe_key').nullable();
                t.string('shipengine_api_key').nullable();
                t.json('shipengine_carriers').nullable();
                t.string('shipping_from_name').nullable();
                t.string('shipping_from_streetAddress').nullable();
                t.string('shipping_from_extendedAddress').nullable();
                t.string('shipping_from_company').nullable();
                t.string('shipping_from_city').nullable();
                t.string('shipping_from_state').nullable();
                t.string('shipping_from_postalCode').nullable();
                t.string('shipping_from_countryCodeAlpha2', 2).nullable();
                t.string('shipping_from_phone').nullable();
                t.json('supported_currencies').nullable();
                t.string('default_currency').nullable();
                t.string('order_details_page_url').nullable();
                t.boolean('active').defaultTo(true);
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();

                t.index([
                    'id'
                ]);
            }
        ),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),
        knex.raw( getSql_createPolicyEnableSelectBasedOnId(tableName) ),
        knex.raw( getSql_grantSelectUpdate(tableName) )
    ]);
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(tableName);
};
