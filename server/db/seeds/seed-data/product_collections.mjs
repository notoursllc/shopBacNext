import tables from '../../utils/tables.js';

function seed(knex) {
    return knex(tables.product_collections)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const data = [
                    {
                        name: 'Fall 2020',
                        value: 1,
                        description: 'fall 2020 description',
                        seo_page_title: 'BreadVan Fall 2020 Collection!',
                        seo_page_desc: 'An exciting description goes here',
                        seo_uri: 'fall2020'
                    }
                ];

                const promises = [];

                function makeTenantData(tenantId) {
                    data.forEach((obj) => {
                        promises.push(
                            knex(tables.product_collections).insert({
                                published: true,
                                tenant_id: tenantId,
                                name: obj.name,
                                value: obj.value,
                                description: obj.description,
                                seo_page_title: obj.seo_page_title,
                                seo_page_desc: obj.seo_page_desc,
                                seo_uri: obj.seo_uri
                            })
                        )
                    });
                }

                makeTenantData(process.env.TEST_TENANT_ID);
                makeTenantData('22222222-2222-2222-2222-222222222222');

                return Promise.all(promises);
            }
        );
};

export default {
    seed
}
