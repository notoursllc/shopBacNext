import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdate
} from '../utils/policies.js'

const tableName = tables.product_artists;

export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(true);
                t.boolean('is_global').defaultTo(true);
                t.string('name').notNullable();
                t.text('description').nullable();
                t.string('website').notNullable();
                t.string('city').nullable();
                t.string('state').nullable();
                t.string('countryCodeAlpha2', 2).nullable();
                t.string('image').nullable();
                t.string('alt_text').nullable();
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

        knex.raw( getSql_createPolicyEnableAllBasedOnTenantId(tableName) ),

        knex.raw( getSql_grantSelectInsertUpdate(tableName) ),
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
