const { DB_TABLES } = require('../../plugins/core/services/CoreService');

const faker = require('faker');
const randomUuid = faker.random.uuid;

exports.seed = (knex) => {
    return knex(DB_TABLES.product_collections)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const promises = [];
                const d = new Date();

                [
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
                ].forEach((obj) => {
                    promises.push(
                        knex(DB_TABLES.product_artists).insert({
                            id: randomUuid(),
                            tenant_id: process.env.TEST_TENANT_ID,
                            published: obj.published,
                            name: obj.name,
                            description: obj.description,
                            website: obj.website,
                            city: obj.city,
                            state: obj.state,
                            countryCodeAlpha2: obj.countryCodeAlpha2,
                            created_at: d,
                            updated_at: d
                        })
                    )
                });

                return Promise.all(promises);
            }
        );
};
