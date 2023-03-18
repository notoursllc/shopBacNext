import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import CartRefundService from '../../services/cart/CartRefundService.js';

export default class CartRefundController extends BaseController {

    constructor() {
        super(new CartRefundService());
    }


    async getCartRefundSummaryHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartRefundController.getCartRefundSummaryHandler', {
                meta: request.query
            });

            const results = await this.service.getCartRefundSummary(request.knex, request.query.cart_id);

            global.logger.info('RESPONSE: CartRefundController.getCartRefundSummaryHandler', {
                meta: results
            });

            return h.apiSuccess(results)
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.notFound(err);
        }
    }


    async addRefundHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartRefundController.addRefundHandler', {
                meta: request.payload
            });

            const CartRefund = await this.service.addRefund(request.knex, request.payload);

            global.logger.info('RESPONSE: CartItemCtrl.addRefundHandler', {
                meta: CartRefund
            });

            return h.apiSuccess(CartRefund);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
