import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdateDelete
} from '../utils/policies.js';

const tableName = tables.product_collections;


export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(false);
                t.string('name').nullable();
                t.integer('value').nullable(); // bit
                t.string('description').nullable();
                t.string('image_url').nullable();

                // SEO
                t.string('seo_page_title').nullable();
                t.text('seo_page_desc').nullable();
                t.string('seo_uri').nullable();

                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();

                t.index([
                    'id',
                    'tenant_id'
                ]);
            }
        ),

        knex.raw( getSql_enableRlsPolicyOnTable(tableName) ),
        knex.raw( getSql_createPolicyEnableAllBasedOnTenantId(tableName) ),
        knex.raw( getSql_grantSelectInsertUpdateDelete(tableName) )
    ]);
};


export function down(knex) {
    return knex.schema.dropTableIfExists(tableName);
};
