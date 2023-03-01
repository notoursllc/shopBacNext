import tables from '../../utils/tables.js';

function seed(knex) {
    return knex(tables.product_accent_messages)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${tables.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                const data = ['Just In!', 'Sold Out'];
                const promises = [];

                function makeTenantData(tenantId) {
                    data.forEach((message) => {
                        promises.push(
                            knex(tables.product_accent_messages).insert({
                                tenant_id: tenantId,
                                message: message,
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
