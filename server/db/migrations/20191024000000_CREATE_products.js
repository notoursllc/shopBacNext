import tables from '../utils/tables.js';
import {
    getSql_enableRlsPolicyOnTable,
    getSql_createPolicyEnableAllBasedOnTenantId,
    getSql_grantSelectInsertUpdate
} from '../utils/policies.js';

const tableName = tables.products;

export function up(knex) {
    return Promise.all([
        knex.schema.createTable(
            tableName,
            (t) => {
                t.uuid('id').primary().unique().defaultTo(knex.raw('uuid_generate_v4()'));
                t.uuid('tenant_id').nullable();
                t.boolean('published').defaultTo(false);
                t.string('title').nullable();
                t.string('caption').nullable();
                t.text('description').nullable();
                t.text('copyright').nullable();

                t.jsonb('metadata').nullable();
                t.boolean('is_good').defaultTo(false); // good / service

                // TYPES
                t.integer('type').nullable();
                t.integer('sub_type').nullable();
                t.integer('sales_channel_type').nullable();
                t.integer('package_type').nullable();
                t.integer('vendor_type').nullable();
                t.integer('collections').nullable();
                t.integer('gender_type').nullable();
                t.integer('fit_type').nullable();
                t.integer('sleeve_length_type').nullable();
                t.integer('feature_type').nullable();

                // SEO
                t.text('seo_page_title').nullable();
                t.text('seo_page_desc').nullable();
                t.string('seo_uri').nullable();

                // MEDIA
                t.string('youtube_video_url').nullable();
                t.jsonb('video').nullable();

                // SHIPPING
                t.boolean('shippable').defaultTo(true);
                t.string('customs_country_of_origin').nullable();
                t.string('customs_harmonized_system_code').nullable();

                // PACKAGING
                t.boolean('ship_alone').defaultTo(false);
                t.float('packing_length_cm').nullable();
                t.float('packing_width_cm').nullable();
                t.float('packing_height_cm').nullable();

                // TAX
                t.string('tax_code').nullable();

                // TIMESTAMPS
                t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
                t.timestamp('updated_at', true).nullable();
                t.timestamp('deleted_at', true).nullable();

                // Foreign Key
                t.uuid('product_artist_id')
                    .notNullable()
                    .references('id')
                    .inTable(tables.product_artists)
                    .nullable();

                t.index([
                    'id',
                    'tenant_id',
                    'type',
                    'sub_type'
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
