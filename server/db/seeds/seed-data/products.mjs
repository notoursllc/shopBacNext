import tables from '../../utils/tables.js';

async function seed(knex) {

    async function seedArtists() {
        const artists = [
            {
                tenant_id: process.env.TEST_TENANT_ID,
                published: true,
                name: 'Wayne Gretzky',
                description: 'The best of all time',
                website: 'https://www.nhl.com',
                city: 'Edmonton',
                state: 'AL',
                countryCodeAlpha2: 'CA'
            },
            {
                tenant_id: '22222222-2222-2222-2222-222222222222',
                published: true,
                name: 'Mario Lemieux',
                description: 'Super Mario',
                website: 'https://www.nhl.com',
                city: 'Pittsburgh',
                state: 'PA',
                countryCodeAlpha2: 'US'
            }
        ];

        const artistPromises = [];

        await knex(tables.product_artists)
            .del()
            .then(async () => {
                artists.forEach((obj) => {
                    artistPromises.push(
                        knex(tables.product_artists)
                            .returning(['id', 'tenant_id'])
                            .insert(obj)
                    )
                });
            });

        const result = await Promise.all(artistPromises);
        // console.log("RESULTS", result)
        return result.map(arr => arr[0]);
    }


    async function seedProductVariants(products) {
        const data = products.map((product) => {
            return {
                product_id: product.id,
                tenant_id: product.tenant_id,
                published: true,
                ordinal: 1,
                label: 'variant label 1',
                currency: 'USD',
                is_taxable: true
            }
        });

        const variantPromises = [];

        await knex(tables.product_variants)
            // .del()
            .then(async () => {
                data.forEach((obj) => {
                    variantPromises.push(
                        knex(tables.product_variants)
                            .returning(['id', 'tenant_id'])
                            .insert(obj)
                    )
                });
            });

        const result = await Promise.all(variantPromises);
        return result.map(arr => arr[0]);
    }


    async function seedProductVariantSkus(variants) {
        const data = variants.map((variant) => {
            return {
                product_variant_id: variant.id,
                tenant_id: variant.tenant_id,
                published: true,
                ordinal: 1,
                label: 'sku label 1',
                sku: 123,
                barcode: 234,
                base_price: 1000,
                cost_price: 500,
                is_on_sale: false,
                weight_oz: 5,
                inventory_count: 10,
                track_inventory_count: true,
                visible_if_no_inventory: true
            }
        });

        const promises = [];

        await knex(tables.product_variant_skus)
            .del()
            .then(async () => {
                data.forEach((obj) => {
                    promises.push(
                        knex(tables.product_variant_skus)
                            .returning(['id', 'tenant_id'])
                            .insert(obj)
                    )
                });
            });

        const result = await Promise.all(promises);
        return result.map(arr => arr[0]);
    }


    await knex.raw(`TRUNCATE TABLE ${tables.products}, ${tables.product_variants}, ${tables.product_variant_skus}, ${tables.product_artists} CASCADE`);

    return knex(tables.products)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${tables.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(async () => {
            const artists = await seedArtists();

            const data = [
                {
                    published: true,
                    title: 'product 1',
                    caption: 'prod 1 caption',
                    description: 'prod 1 desc',
                    copyright: 'prod 1 copyright',
                    is_good: true,
                    seo_page_title: 'prod 1 seo page title',
                    seo_page_desc: 'prod 1 seo page desc',
                }
            ];

            const promises = [];

            function makeTenantData(tenantId) {
                data.forEach((obj) => {
                    promises.push(
                        knex(tables.products)
                            .returning(['id', 'tenant_id'])
                            .insert({
                                tenant_id: tenantId,
                                product_artist_id: artists.find(obj => obj.tenant_id === tenantId)?.id,
                                ...obj,
                            })
                    )
                });
            }

            makeTenantData(process.env.TEST_TENANT_ID);
            makeTenantData('22222222-2222-2222-2222-222222222222');

            let products = await Promise.all(promises);
            products = products.map(arr => arr[0])

            console.log("PRODUCTS", products);

            const productVariants = await seedProductVariants(products);
            console.log("productVariants", productVariants)

            await seedProductVariantSkus(productVariants);

            return products;
        }
    );
}

export default {
    seed
}
