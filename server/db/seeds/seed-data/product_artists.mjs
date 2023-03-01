import tables from '../../utils/tables.js';

function seed(knex) {
    return knex(tables.product_artists)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${tables.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const data = [
                    {
                        published: true,
                        name: 'Wayne Gretzky',
                        description: 'The best of all time',
                        website: 'https://www.nhl.com',
                        city: 'Edmonton',
                        state: 'AL',
                        countryCodeAlpha2: 'CA'
                    },
                    {
                        published: true,
                        name: 'Mario Lemieux',
                        description: 'Super Mario',
                        website: 'https://www.nhl.com',
                        city: 'Pittsburgh',
                        state: 'PA',
                        countryCodeAlpha2: 'US'
                    },
                    {
                        published: false,
                        name: 'Joe Thornton',
                        description: 'Jumbo',
                        website: 'https://www.nhl.com',
                        city: 'San Jose',
                        state: 'CA',
                        countryCodeAlpha2: 'US'
                    }
                ];

                const promises = [];

                function makeTenantData(tenantId) {
                    data.forEach((obj) => {
                        promises.push(
                            knex(tables.product_artists).insert({
                                tenant_id: tenantId,
                                published: obj.published,
                                name: obj.name,
                                description: obj.description,
                                website: obj.website,
                                city: obj.city,
                                state: obj.state,
                                countryCodeAlpha2: obj.countryCodeAlpha2,
                            })
                        )
                    });
                }

                makeTenantData(process.env.TEST_TENANT_ID);
                makeTenantData('22222222-2222-2222-2222-222222222222');

                return Promise.all(promises);
            }
        );
}

export default {
    seed
}
