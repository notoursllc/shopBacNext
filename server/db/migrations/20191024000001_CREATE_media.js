import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdate
} from '../utils/policies.js';

const tableName = tables.media;


export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.uuid('tenant_id').nullable();
                t.string('resource_type').nullable();
                t.string('alt_text').nullable();
                t.integer('ordinal').nullable().defaultTo(1);
                t.string('url').nullable();
                t.string('third_party_id').nullable();

                // TIMESTAMPS
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
