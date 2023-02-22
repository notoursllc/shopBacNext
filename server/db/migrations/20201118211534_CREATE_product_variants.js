import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdate
} from '../utils/policies.js';

const tableName = tables.product_variants;

export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(true);
                t.integer('ordinal').nullable().defaultTo(1);
                t.string('label').nullable();
                t.integer('basic_color_type').nullable();
                t.string('sku_label_type').nullable();

                // PRICING
                t.string('currency').defaultTo('usd');
                t.boolean('is_taxable').defaultTo(true);
                t.string('tax_code').nullable();

                // ACCENT MESSAGE
                t.string('accent_message_id').nullable();
                t.timestamp('accent_message_begin', true).nullable();
                t.timestamp('accent_message_end', true).nullable();

                //  MEDIA
                t.jsonb('images').nullable();
                t.jsonb('swatches').nullable();

                // SHIPPING
                t.string('customs_country_of_origin').nullable();

                // TIMESTAMPS
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();
                t.timestamp('deleted_at', true).nullable();

                // Foreign Keys:
                t.uuid('product_id')
                    .notNullable()
                    .references('id')
                    .inTable(tables.products);
                // .onDelete('CASCADE');

                t.index([
                    'id',
                    'tenant_id',
                    'product_id'
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
