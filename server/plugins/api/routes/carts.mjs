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


        /******************
         * ORDER
         ******************/
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
        },


        /******************
         * SHIPPING
         ******************/
        {
            method: 'POST',
            path: '/cart/shipping/validateAddress',
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
            method: 'POST',
            path: '/cart/shipping/estimate',
            options: {
                description: 'Returns shipping rates for the cart',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.shippingRateEstimateHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/shipping/rate',
            options: {
                description: 'Selects a selected shipping rate for the cart.',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForSelectShippingRate()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.selectShippingRateHandler(request, h);
                }
             }
        },
        {
            method: 'POST',
            path: '/cart/shipping/label',
            options: {
                description: 'Buys a shipping label from ShipEngine',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId(),
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.buyShippingLabelForCartHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/shipping/label/tracking_status',
            options: {
                description: 'Webhook to receive a tracking status update',
                auth: false,
                handler: (request, h) => {
                    return CartCtrl.trackingWebhookHandler(request, h);
                }
            }
        },


        /******************
         * PAYMENT
         ******************/
        {
            method: 'GET',
            path: '/cart/payment',
            options: {
                description: 'Gets payment info for the given cart id',
                auth: {
                    strategies: ['storeauth']
                },
                validate: {
                    query: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId(),
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.getPaymentHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/payment/intent',
            options: {
                description: 'Submits an order to Stripe for a given cart',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForId(),
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.submitStripeOrderForCartHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/cart/payment',
            options: {
                description: 'Persist a successful payment',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartCtrl.service.getValidationSchemaForSaveStripePayment()
                    })
                },
                handler: (request, h) => {
                    return CartCtrl.paymentSuccessHandler(request, h);
                }
            }
        },

        {
            method: 'GET',
            path: '/cart/{param*}',
            options: {
                description: 'Returns 404 response',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                handler: (request, h) => {
                    throw Boom.notFound();
                }
            }
        }
    ]);
}
