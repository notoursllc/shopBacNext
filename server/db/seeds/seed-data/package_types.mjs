import tables from '../../utils/tables.js';

/**
 * Rounds a number down to the nearest whole cm
 * Rounding up would ADD volume to a package, so that wouldnt be right.
 * Rounding down seems safe & good enough since were only talking about a fraction of a cm
 *
 * @param Number inches
 * @returns Number
 */
function inchesToCm(inches) {
    return Number.parseFloat(inches * 2.54).toFixed(2);
}

function seed(knex) {
    return knex(tables.package_types)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                /*
                * A few of these boxes are similar but it would be good
                * to know which ones over time are the most used
                */
                const data = [
                    {
                        label: 'Priority Mail Box - 4',
                        description: '7"(L) x 7"(W) x 6"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-box-4-P_O_BOX4',
                        length_cm: inchesToCm(7),
                        width_cm: inchesToCm(7),
                        height_cm: inchesToCm(6),
                        ordinal: 1
                    },
                    {
                        label: 'Priority Mail Shoe Box',
                        description: '7-1/2"(L) x 5-1/8"(W) x 14-3/8"(H)',
                        length_cm: inchesToCm(7.5),
                        width_cm: inchesToCm(5.125),
                        height_cm: inchesToCm(14.375),
                        ordinal: 2
                    },
                    {
                        label: 'Priority Mail Box - 1096L',
                        description: '9-1/4"(L) x 6-1/4"(W) x 2"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-box-1096l-P_O_1096L',
                        length_cm: inchesToCm(9.25),
                        width_cm: inchesToCm(6.25),
                        height_cm: inchesToCm(2),
                        ordinal: 3
                    },
                    {
                        label: 'Priority Mail Box - 1097',
                        description: '11-1/3"(L) x 2-3/9"(W) x 13-1/9"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-box-1097-P_O_1097',
                        length_cm: inchesToCm(11.33),
                        width_cm: inchesToCm(2.33),
                        height_cm: inchesToCm(13.11),
                        ordinal: 4
                    },
                    {
                        label: 'Priority Mail Box - 1092',
                        description: '12-1/8"(L) x 2-3/4"(W) x 13-3/8"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-box-1092-P_O_1092',
                        length_cm: inchesToCm(12.125),
                        width_cm: inchesToCm(2.75),
                        height_cm: inchesToCm(13.375),
                        ordinal: 5
                    },
                    {
                        label: 'Priority Mail Box - 1095',
                        description: '12-3/8"(L) x 3"(W) x 15-1/4"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-box-1095-P_O_1095',
                        length_cm: inchesToCm(12.375),
                        width_cm: inchesToCm(3),
                        height_cm: inchesToCm(15.25),
                        ordinal: 6
                    },
                    {
                        label: 'Priority Mail Box - 7',
                        description: '12"(L) x 12"(W) x 8"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-box-7-P_O_BOX7',
                        length_cm: inchesToCm(12),
                        width_cm: inchesToCm(12),
                        height_cm: inchesToCm(8),
                        ordinal: 7
                    },
                    {
                        label: 'Priority Mail Regional Rate Box - A1',
                        description: '10"(L) x 7"(W) x 4-3/4"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-regional-rate-box-a1-P_RRB_A1',
                        length_cm: inchesToCm(10),
                        width_cm: inchesToCm(7),
                        height_cm: inchesToCm(4.75),
                        ordinal: 8
                    },
                    {
                        label: 'Priority Mail Regional Rate Box - B1',
                        description: '12-1/8"(L) x 10-3/8"(W) x 5-1/4"(H)',
                        notes: 'https://store.usps.com/store/product/shipping-supplies/priority-mail-regional-rate-box-b1-P_RRB_B1',
                        length_cm: inchesToCm(12.125),
                        width_cm: inchesToCm(10.375),
                        height_cm: inchesToCm(5.25),
                        ordinal: 9
                    }
                ];

                const promises = [];

                function makeTenantData(tenantId) {
                    data.forEach((obj) => {
                        promises.push(
                            knex(tables.package_types).insert({
                                tenant_id: tenantId,
                                ...obj
                            }),
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
