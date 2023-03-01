import tables from '../../utils/tables.js';

function seed(knex) {
    return knex(tables.product_color_swatches)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${tables.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const data = [
                    { hex: '#e21212', label: 'Red', description: 'Red color description' },
                    { hex: '#4b7bd2', label: 'Blue', description: 'Blue color description' },
                    { hex: '#62d24b', label: 'Green', description: 'Green color description' }
                ];

                const promises = [];

                function makeTenantData(tenantId) {
                    data.forEach((obj) => {
                        promises.push(
                            knex(tables.product_color_swatches).insert({
                                tenant_id: tenantId,
                                ...obj
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
