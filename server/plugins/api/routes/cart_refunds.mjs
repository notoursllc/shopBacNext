import Joi from 'joi';
import CartRefundController from '../../../controllers/cart/CartRefundController.js';

const CartRefundCtrl = new CartRefundController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/cart/refunds',
            options: {
                description: 'Gets a list of refunds',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    query: Joi.object({
                        ...CartRefundCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return CartRefundCtrl.searchHandler(request, h)
                }
            }
        },
        {
            method: 'GET',
            path: '/cart/refunds/summary',
            options: {
                description: 'Gets a list of refunds',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    query: Joi.object({
                        ...CartRefundCtrl.service.getValidationSchemaForRefundSummary()
                    })
                },
                handler: (request, h) => {
                    return CartRefundCtrl.getCartRefundSummaryHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/refund',
            options: {
                description: 'Refunds money to the customer',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartRefundCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return CartRefundCtrl.addRefundHandler(request, h);
                }
            }
        },
    ]);
}
