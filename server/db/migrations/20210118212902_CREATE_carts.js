import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdate
} from '../utils/policies.js';

const tableName = tables.carts;


export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.uuid('tenant_id').nullable();

                t.string('billing_firstName').nullable();
                t.string('billing_lastName').nullable();
                t.string('billing_company').nullable();
                t.string('billing_streetAddress').nullable();
                t.string('billing_extendedAddress').nullable();
                t.string('billing_city').nullable();
                t.string('billing_state').nullable();
                t.string('billing_postalCode').nullable();
                t.string('billing_countryCodeAlpha2', 2).nullable();
                t.string('billing_phone').nullable();
                t.boolean('billing_same_as_shipping').defaultTo(true);

                t.string('shipping_firstName').nullable();
                t.string('shipping_lastName').nullable();
                t.string('shipping_streetAddress').nullable();
                t.string('shipping_extendedAddress').nullable();
                t.string('shipping_company').nullable();
                t.string('shipping_city').nullable();
                t.string('shipping_state').nullable();
                t.string('shipping_postalCode').nullable();
                t.string('shipping_countryCodeAlpha2', 2).nullable();
                t.string('shipping_phone').nullable();
                t.string('shipping_email').nullable();

                t.string('currency').notNullable().defaultTo('usd');
                t.float('currency_exchange_rate').nullable();
                t.jsonb('selected_shipping_rate').nullable();
                t.jsonb('shipping_rate_quote').nullable();
                t.jsonb('shipping_label').nullable();
                t.jsonb('tax_nexus_applied').nullable();
                t.string('stripe_payment_intent_id').nullable();
                t.string('stripe_order_id').nullable();
                t.string('paypal_order_id').nullable();
                t.integer('sales_tax').nullable();
                t.jsonb('admin_order_notes').nullable();
                t.boolean('is_gift').defaultTo(false);

                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();
                t.timestamp('deleted_at', true).nullable();
                t.timestamp('closed_at', true).nullable();
                t.timestamp('shipped_at', true).nullable();

                t.index([
                    'id',
                    'tenant_id'
                ]);
            }
        ),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),
        knex.raw( getSql_createPolicyEnableAllBasedOnTenantId(tableName) ),
        knex.raw( getSql_grantSelectInsertUpdate(tableName) )
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
