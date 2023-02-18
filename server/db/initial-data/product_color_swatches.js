const { DB_TABLES } = require('../../plugins/core/services/CoreService');

const faker = require('faker');
const randomUuid = faker.random.uuid;

exports.seed = (knex) => {
    return knex(DB_TABLES.product_color_swatches)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const promises = [];
                const d = new Date();

                [
                    { hex: '#e21212', label: 'Red', description: 'Red color description' },
                    { hex: '#4b7bd2', label: 'Blue', description: 'Blue color description' },
                    { hex: '#62d24b', label: 'Green', description: 'Green color description' }
                ].forEach((obj) => {
                    promises.push(
                        knex(DB_TABLES.product_color_swatches).insert({
                            id: randomUuid(),
                            tenant_id: process.env.TEST_TENANT_ID,
                            hex: obj.hex,
                            label: obj.label,
                            description: obj.description,
                            created_at: d,
                            updated_at: d
                        }),
                    )
                });

                return Promise.all(promises);
            }
        );
};
