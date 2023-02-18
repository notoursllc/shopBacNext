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
                        name: 'Fall 2020',
                        value: 1,
                        description: 'fall 2020 description',
                        seo_page_title: 'BreadVan Fall 2020 Collection!',
                        seo_page_desc: 'An exciting description goes here',
                        seo_uri: 'fall2020'
                    }
                ].forEach((obj) => {
                    promises.push(
                        knex(DB_TABLES.product_collections).insert({
                            id: randomUuid(),
                            published: true,
                            tenant_id: process.env.TEST_TENANT_ID,
                            name: obj.name,
                            value: obj.value,
                            description: obj.description,
                            seo_page_title: obj.seo_page_title,
                            seo_page_desc: obj.seo_page_desc,
                            seo_uri: obj.seo_uri,
                            created_at: d,
                            updated_at: d
                        })
                    )
                });

                return Promise.all(promises);
            }
        );
};
