
import Joi from 'joi';
import BaseService from '../BaseService.js';
import CartItemDao from '../../db/dao/cart/CartItemDao.js';
import { makeArray } from '../../utils/index.js';

export default class CartItemsService extends BaseService {

    constructor() {
        super(new CartItemDao());
    }


    /**
     * Adds variant relation to a list of carts
     *
     * @param {*} knex
     * @param {*} carts
     * @returns []
     */
    async addRelationToCarts(knex, carts) {
        await this.dao.addRelations(
            carts,
            'id',
            knex.select(this.dao.getAllColumns()).from(this.dao.tableName),
            'cart_id',
            'cart_items'
        );

        makeArray(carts).forEach((cart) => {
            this.dao.addVirtuals(cart.cart_items);
        });

        return carts;
    }


    // getValidationSchemaForAdd() {
    //     const schema = { ...super.getValidationSchemaForAdd() };
    //     schema.published = schema.published.default(false);
    //     schema.skus = Joi.alternatives().try(
    //         Joi.allow(null),
    //         Joi.array().items(
    //             Joi.object(this.ProductVariantSkuService.getValidationSchemaForAdd())
    //         )
    //     );

    //     return schema;
    // }


    // getValidationSchemaForDelete() {
    //     return {
    //         ...this.getValidationSchemaForId(),
    //         media_id: Joi.string().uuid().required()
    //     }
    // }

}
