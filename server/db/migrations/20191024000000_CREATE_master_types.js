import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableSelectBasedOnTenantId,
    getSql_grantSelectInsertUpdateDelete
} from '../utils/policies.js'

const tableName = tables.master_types;

export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
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

        knex.raw( getSql_createPolicyEnableSelectBasedOnTenantId(tableName) ),

        knex.raw( getSql_grantSelectInsertUpdateDelete(tableName) ),
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
