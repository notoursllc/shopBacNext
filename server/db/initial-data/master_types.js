const { DB_TABLES } = require('../../plugins/core/services/CoreService');

const faker = require('faker');
const randomUuid = faker.random.uuid;

exports.seed = (knex) => {
    return knex(DB_TABLES.master_types)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const promises = [];
                const sampleData = {
                    product_type: [
                        { name: 'Apparel', slug: 'apparel', description: 'apparel description' }
                    ],
                    product_sub_type: [
                        { name: 'Hats', slug: 'hats', description: 'hats description' },
                        { name: 'Tops', slug: 'tops', description: 'tops description' }
                    ],
                    product_basic_color_type: [
                        { name: 'Black', slug: 'black', metadata: {"property":"hex","value":"#000"} },
                        { name: 'White', slug: 'white', metadata: {"property":"hex","value":"#fff"} },
                        { name: 'Red', slug: 'red', metadata: {"property":"hex","value":"#e7352b"} },
                        { name: 'Blue', slug: 'blue', metadata: {"property":"hex","value":"#2290c8"} },
                        { name: 'Green', slug: 'green', metadata: {"property":"hex","value":"#7bba3c"} },
                        { name: 'Grey', slug: 'grey', metadata: {"property":"hex","value":"#808080"} },
                        { name: 'Orange', slug: 'orange', metadata: {"property":"hex","value":"#f36b26"} },
                        { name: 'Yellow', slug: 'yellow', metadata: {"property":"hex","value":"#fdd532"} },
                        { name: 'Brown', slug: 'brown', metadata: {"property":"hex","value":"#825d41"} },
                        { name: 'Pink', slug: 'pink', metadata: {"property":"hex","value":"#f0728f"} },
                        { name: 'Purple', slug: 'purple', metadata: {"property":"hex","value":"#8d429f"} },
                        { name: 'Multi-color', slug: 'multi_color', metadata: {"property":"hex","value":""} }
                    ],
                    product_feature_type: [
                        { name: 'Pockets', slug: 'pockets' },
                        { name: 'Hooded', slug: 'hooded' },
                        { name: 'Seamless', slug: 'seamless' },
                    ],
                    product_fit_type: [
                        { name: 'Loose', slug: 'loose', description: 'loose description' },
                        { name: 'Slim', slug: 'slim', description: 'slim description' },
                        { name: 'Standard', slug: 'standard', description: 'standard description' },
                    ],
                    product_gender_type: [
                        { name: 'Mens', slug: 'mens', description: 'mens description' },
                        { name: 'Womens', slug: 'womens', description: 'womens description' },
                        { name: 'Boys', slug: 'boys', description: 'boys description' },
                        { name: 'Girls', slug: 'girls', description: 'girls description' },
                        { name: 'Unisex', slug: 'unisex', description: 'unisex description' },
                    ],
                    product_sales_channel_type: [
                        { name: 'goBreadVan.com', slug: 'gobreadvan.com', description: 'gobreadvan.com description' },
                    ],
                    product_sleeve_length_type: [
                        { name: 'Short sleeve', slug: 'short sleeve', description: 'short sleeve description' },
                        { name: 'Long sleeve', slug: 'long sleeve', description: 'long sleeve description' },
                        { name: 'Sleeveless / Tank', slug: 'sleeveless_tank', description: 'sleeveless_tank description' },
                    ],
                    product_vendor_type: [
                        { name: 'BreadVan', slug: 'breadvan', description: 'breadvan description' },
                    ],
                    product_size_type: [
                        { name: 'XS', slug: 'XS' },
                        { name: 'S', slug: 'S' },
                        { name: 'M', slug: 'M' },
                        { name: 'L', slug: 'L' },
                        { name: 'XL', slug: 'XL' },
                        { name: '2XL', slug: '2XL' },
                        { name: '3XL', slug: '3XL' },
                        { name: '4XL', slug: '4XL' },
                        { name: '5XL', slug: '5XL' }
                    ]
                }

                const d = new Date();

                for(const key in sampleData) {
                    const fibs = [];

                    sampleData[key].forEach((obj, index) => {
                        const fibonacci = index === 0 ? 1 : fibs[index-1] * 2
                        fibs.push(fibonacci)

                        promises.push(
                            knex(DB_TABLES.master_types).insert({
                                id: randomUuid(),
                                tenant_id: process.env.TEST_TENANT_ID,
                                published: true,
                                object: key,
                                name: obj.name,
                                slug: obj.slug,
                                value: fibonacci,
                                description: obj.description || '',
                                metadata: JSON.stringify([
                                    obj.metadata || {"property":"sample","value":"meta data"}
                                ]),
                                ordinal: index + 1,
                                created_at: d,
                                updated_at: d
                            })
                        )
                    })
                }

                return Promise.all(promises);
            }
        );
};
