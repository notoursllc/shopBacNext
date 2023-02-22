import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdate
} from '../utils/policies.js';

const tableName = tables.cart_refunds;

export async function up(knex) {
    await knex.schema.createTable(
        tableName,
        (t) => {
            t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
            t.uuid('tenant_id').nullable();
            t.integer('subtotal_refund').notNullable().defaultTo(0);
            t.integer('shipping_refund').notNullable().defaultTo(0);
            t.integer('tax_refund').notNullable().defaultTo(0);
            t.text('description').nullable();
            t.string('reason').nullable(); // duplicate, fraudulent, requested_by_customer
            t.string('stripe_refund_id').nullable();
            t.string('paypal_refund_id').nullable();

            // Foreign Keys:
            t.uuid('cart_id')
                .notNullable()
                .references('id')
                .inTable(tables.carts);

            // TIMESTAMPS
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();
            t.timestamp('deleted_at', true).nullable();

            t.index([
                'id',
                'tenant_id',
                'cart_id'
            ]);
        }
    );

    return Promise.all([
        // There's no knex support yet for generated columns: https://github.com/knex/knex/issues/3987
        knex.raw(`
            ALTER TABLE ${tableName}
            ADD COLUMN total_refund integer GENERATED ALWAYS AS (subtotal_refund + shipping_refund + tax_refund) STORED;
        `),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),
        knex.raw( getSql_createPolicyEnableAllBasedOnTenantId(tableName) ),
        knex.raw( getSql_grantSelectInsertUpdate(tableName) )
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
