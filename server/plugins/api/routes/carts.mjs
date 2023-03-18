import Joi from 'joi';
import CartController from '../../../controllers/cart/CartController.js';

const CartCtrl = new CartController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/carts',
            options: {
                description: 'Gets a list of carts',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/cart',
            options: {
                description: 'Gets a shopping cart for the given ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart',  // NOTE: this was '/cart/upsert' in the old API
            options: {
                description: 'Creates or updates a Cart',
                auth: {
                    strategies: ['storeauth']
                },
                validate: {
                    payload: Joi.object({
                        // TODO: I think this should be more restrictive.
                        // I dont think we want the client to update every Cart property
                        ...CartCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/shippingaddress/validate',
            options: {
                description: 'Validates the shipping address for the cart',
                auth: {
                    strategies: ['storeauth']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForShippingAddress()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.validateShippingAddressHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/cart/order',
            options: {
                description: 'Gets a closed cart by ID, as well as the related ShipEngine data (label)',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    query: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId(),
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.getOrderHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/order/resend-confirmation',
            options: {
                description: 'Re-sends the order confirmation email for a given closed cart',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId(),
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.resendOrderConfirmaionHandler(request, h);
                }
            }
        }
    ]);
}
