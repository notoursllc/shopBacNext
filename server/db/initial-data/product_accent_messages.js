const { DB_TABLES } = require('../../plugins/core/services/CoreService');

const faker = require('faker');
const randomUuid = faker.random.uuid;

exports.seed = (knex) => {
    return knex(DB_TABLES.product_accent_messages)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const promises = [];
                const d = new Date();

                ['Just In!', 'Sold Out'].forEach((message) => {
                    promises.push(
                        knex(DB_TABLES.product_accent_messages).insert({
                            id: randomUuid(),
                            tenant_id: process.env.TEST_TENANT_ID,
                            message: message,
                            created_at: d,
                            updated_at: d
                        })
                    )
                });

                return Promise.all(promises);
            }
        );
};
