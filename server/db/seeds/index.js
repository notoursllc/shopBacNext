import master_types from './seed-data/master_types.mjs';
import package_types from './seed-data/package_types.mjs';
import product_collections from './seed-data/product_collections.mjs';
import product_accent_messages from './seed-data/product_accent_messages.mjs';
import product_color_swatches from './seed-data/product_color_swatches.mjs';
import products from './seed-data/products.mjs';

/**
 * NOTE: Do not seed 'tenants' and 'tenant_members' for security purposes (so the seed
 * files that contain credentails are not in github)
 *
 * @param knex
 * @param Promise
 * @returns {*}
 */
export async function seed(knex, Promise) {
    await master_types.seed(knex);
    await package_types.seed(knex);
    await product_collections.seed(knex);
    await product_accent_messages.seed(knex);
    await product_color_swatches.seed(knex);
    await products.seed(knex);
};
