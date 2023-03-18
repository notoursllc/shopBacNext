import Joi from 'joi';
import BaseDao from '../BaseDao.js';
import { makeArray } from '../../../utils/index.js';

export default class CartItemDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.cart_items;
        this.hidden = ['tenant_id'];
        this.schema = {
            tenant_id: Joi.string().uuid(),
            qty: Joi.alternatives().try(
                Joi.number().integer().min(0)
            ),
            cart_id: Joi.alternatives().try(
                Joi.string().uuid(),
                Joi.allow(null)
            ),
            product_variant: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            product_variant_sku: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }


    addVirtuals(data) {
        makeArray(data).forEach((cartItem) => {
            cartItem.item_price_total = (function(obj) {
                let total = null;

                if(obj.qty) {
                    const displayPrice = obj.product_variant_sku?.display_price;
                    total = displayPrice ? displayPrice * obj.qty : null;

                    // if(total !== null) {
                    //     total = accounting.toFixed(total, 2);
                    // }
                }

                return total;
            })(cartItem);

            cartItem.item_weight_total = (function(obj) {
                let total = null;

                if(obj.qty) {
                    const weight = obj.product_variant_sku?.weight_oz;
                    total = weight ? weight * obj.qty : null;
                }

                return total;
            })(cartItem);
        });

        return data;
    }

}
