const { DB_TABLES } = require('../../plugins/core/services/CoreService');

const faker = require('faker');
const randomUuid = faker.random.uuid;

exports.seed = (knex) => {
    return knex(DB_TABLES.tax_nexus)
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
                        countryCodeAlpha2: 'US',
                        state: 'CA',
                        tax_rate: '0.0965'

                    }
                ].forEach((obj) => {
                    promises.push(
                        knex(DB_TABLES.tax_nexus).insert({
                            id: randomUuid(),
                            tenant_id: process.env.TEST_TENANT_ID,
                            countryCodeAlpha2: obj.countryCodeAlpha2,
                            state: obj.state,
                            tax_rate: obj.tax_rate,
                            created_at: d,
                            updated_at: d
                        }),
                    )
                });

                return Promise.all(promises);
            }
        );
};
