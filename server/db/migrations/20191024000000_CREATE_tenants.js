import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnTenantId,
    getSql_grantSelectUpdate
} from '../utils/policies.js';

const tableName = tables.tenants;


export async function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.string('auth_password').nullable();
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

        knex.raw(`
            CREATE POLICY "Enable select based on id"
            ON ${tableName}
            AS PERMISSIVE FOR SELECT
            USING (id = current_setting('app.current_tenant')::uuid)
        `),

        knex.raw( getSql_grantSelectUpdate(tableName) )
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
