import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import CartService from '../../services/cart/CartService.js';
import ShipEngineApi from '../../services/shipEngine/ShipEngineApi.js'

export default class CartController extends BaseController {

    constructor() {
        super(new CartService());
    }


    /**
     * This is broken out into a separate function because
     * there is a cost for using the ShipEngine address validation
     * service.
     *
     * TODO: how can I modify this handler so it is not abused
     * by the client?  Some kind of throttling should happen
     * so the user can't call the API over and over.
     */
    async validateShippingAddressHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.validateShippingAddressHandler', {
                meta: request.payload
            });

            // convert the cart shipping params names to respective params for ShipEngine
            // NOTE: Address validation is not 100% reliable.
            // Therefore we should only continue with this transaction if
            // the validation response is 'verified'.  Otherwise we should
            // return the validation error/warning back to the user and let
            // them decide how to procede.
            // The comments in this HackerNews article (about Shopify) were enlightening:
            // https://news.ycombinator.com/item?id=32034643
            const response = await ShipEngineApi.validateAddresses(request.knex, [
                {
                    address_line1: request.payload.shipping_streetAddress,
                    city_locality: request.payload.shipping_city,
                    state_province: request.payload.shipping_state,
                    postal_code: request.payload.shipping_postalCode,
                    country_code: request.payload.shipping_countryCodeAlpha2,
                }
            ]);

            // Hopefully this never happens
            if(!Array.isArray(response)) {
                global.logger.error(`CartController.validateShippingAddressHandler - the API resposne was expected to be an array but it is of type: ${typeof response}`, {
                    meta: { 'API response': response }
                });
                throw Boom.badRequest();
            }

            global.logger.info('RESPONSE: CartController.validateShippingAddressHandler', {
                meta: response[0]
            });

            // https://www.shipengine.com/docs/addresses/validation/#address-status-meanings
            return h.apiSuccess({
                // we only submitted one address so we only care about the first response:
                validation_response: response[0]
            });
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    /**
     * Gets an order (a closed cart) and the related ShipEngine label data
     *
     * @param {*} request
     * @param {*} h
     * @returns {}
     */
    async getOrderHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.getOrderHandler', {
                meta: request.query
            });

            const Order = await this.service.getOrder(request.knex, request.query.id)

            global.logger.info('RESPONSE: CartController.getOrderHandler', {
                meta: Order
            });

            return h.apiSuccess(Order);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async resendOrderConfirmaionHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.resendOrderConfirmaionHandler', {
                meta: request.payload
            });

            const response = await this.service.sendPurchaseReceiptToBuyer(request.knex, request.payload.id);

            global.logger.info('RESPONSE: CartController.resendOrderConfirmaionHandler', {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
        }
    }


    async selectShippingRateHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.selectShippingRateHandler', {
                meta: request.payload
            });

            const Cart = await this.service.setShippingRate(
                request.knex,
                request.payload.rate_id,
                request.payload.id
            );

            global.logger.info('RESPONSE: CartController.selectShippingRateHandler', {
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


    /**
     * Buys a shipping label from ShipEngine
     *
     * @param {*} request
     * @param {*} h
     * @returns {*} shipping label
     */
    async buyShippingLabelForCartHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.buyShippingLabelHandler', {
                meta: request.query
            });

            const UpdatedCart = await this.service.buyShippingLabelForCart(
                request.knex,
                request.payload.id
            );

            global.logger.info('RESPONSE: CartController.buyShippingLabelHandler', {
                meta: UpdatedCart
            });

            return h.apiSuccess(UpdatedCart);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async trackingWebhookHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.trackingWebhookHandler', {
                meta: request.payload
            });

            // the 'user-agent' value in the request header must be from ShipEngine
            // https://www.shipengine.com/docs/tracking/webhooks/#validation
            if(request.headers['user-agent'] !== 'ShipEngine/v1') {
                throw Boom.badRequest();
            }

            await this.service.processTrackingWebhook(
                request.knex,
                request.payload
            )

            global.logger.info('RESPONSE: CartController.trackingWebhookHandler', {});

            return h.apiSuccess();
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async getPaymentHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.getPaymentHandler', {
                meta: request.payload
            });

            const paymentData = await this.service.getOrder(
                request.knex,
                request.query.id
            );

            global.logger.info('RESPONSE: CartController.getPaymentHandler', {
                meta: paymentData.payment
            });

            return h.apiSuccess(paymentData.payment);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async submitStripeOrderForCartHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartController.submitStripeOrderForCartHandler', {
                meta: request.payload
            });

            const submittedOrder = await this.service.submitStripeOrderForCart(request.knex, request.payload.id)

            global.logger.info('RESPONSE: CartController.submitStripeOrderForCartHandler - Stripe resposne', {
                meta: {
                    submittedOrder
                }
            });

            return h.apiSuccess({
                clientSecret: submittedOrder.payment.payment_intent.client_secret
            });
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async paymentSuccessHandler(request, h) {
        try {
            global.logger.info('REQUEST: CartCtrl.paymentSuccessHandler', {
                meta: request.payload
            });

            await this.service.onPaymentSuccess(
                request.knex,
                request.payload.id,
                request.payload.stripe_payment_intent_id
            )

            global.logger.info('RESPONSE: CartCtrl.onPaymentSuccess', {
                meta: {}
            });

            return h.apiSuccess();
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }
}
