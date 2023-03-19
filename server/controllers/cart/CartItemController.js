import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import CartItemService from '../../services/cart/CartItemService.js';


export default class CartItemController extends BaseController {

    constructor() {
        super(new CartItemService());

    }


    async createHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartItemController.createHandler', {
                meta: request.payload
            });

            const Cart = await this.service.create(request.knex, request.payload);

            global.logger.info('RESPONSE: CartItemController.createHandler', {
                meta: Cart
            });

            return h.apiSuccess(Cart);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async updateHandler(request, h) {
        try {
            global.logger.info(`REQUEST: CartItemController.updateHandler`, {
                meta: request.payload
            });

            const Cart = await this.service.update(
                request.knex,
                request.payload.id,
                request.payload.qty
            );

            global.logger.info('RESPONSE: CartItemController.updateHandler', {
                meta: Cart
            });

            return h.apiSuccess(Cart);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async deleteHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartItemController.deleteHandler', {
                meta: request.payload
            });

            const Cart = await this.service.del(request.knex, request.payload.id);

            global.logger.info('RESPONSE: CartItemController.deleteHandler', {
                meta: Cart
            });

            return h.apiSuccess(Cart);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
