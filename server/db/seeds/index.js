const master_types = require('../initial-data/master_types');
const package_types = require('../initial-data/package_types');
const product_collections = require('../initial-data/product_collections');
const product_accent_messages = require('../initial-data/product_accent_messages');
const product_color_swatches = require('../initial-data/product_color_swatches');
const product_artists = require('../initial-data/product_artists');
const tax_nexus = require('../initial-data/tax_nexus');


/**
 * Knex.js's seed functionality does not provide any order of execution guarantees,
 * so this function will run the seeds in the order that we want
 *
 * NOTE: Do not seed 'tenants' and 'tenant_members' for security purposes (so the seed
 * files that contain credentails are not in github)
 *
 * @param knex
 * @param Promise
 * @returns {*}
 */
exports.seed = (knex, Promise) => {
    return master_types.seed(knex, Promise)
        // .then(() => {
        //     return package_types.seed(knex, Promise);
        // })
        .then(() => {
            return product_collections.seed(knex, Promise);
        })
        .then(() => {
            return product_accent_messages.seed(knex, Promise)
        })
        .then(() => {
            return product_color_swatches.seed(knex, Promise)
        })
        .then(() => {
            return product_artists.seed(knex, Promise)
        })
        // .then(() => {
        //     return tax_nexus.seed(knex, Promise)
        // })
        // .then(() => {
               // NOTE: Promise.all requires Bluebird, as the node Promise doesn't support all
               // which is why Im commenting this out for now
        //     return Promise.all([
        //         master_types.seed(knex, Promise),
        //         product_collections.seed(knex, Promise)
        //     ]);
        // });
};
