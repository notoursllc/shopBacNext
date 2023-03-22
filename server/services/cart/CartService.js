import isObject from 'lodash.isobject';
import isString from 'lodash.isstring';
import BaseService from '../BaseService.js';
import CartModel from '../../models/cart/CartModel.js';
import CartItemService from './CartItemService.js';
import StripeApi from '../StripeApi.js';
import TenantService from '../TenantService.js';
import ShipEngineApi from '../shipEngine/ShipEngineApi.js'
import { sendEmail, compileMjmlTemplate } from '../email/EmailService.js';
import { substringOnWords, formatPrice, makeArray } from '../../utils/index.js';


function makeFullName(firstName, lastName) {
    let val = [];

    if(isString(firstName)) {
        val.push(firstName.trim());
    }

    if(isString(lastName)) {
        val.push(lastName.trim());
    }

    return val.join(' ');
}


export default class CartService extends BaseService {

    constructor() {
        super(new CartModel());
        this.TenantService = new TenantService();
    }


    getActiveCart(knex, id) {
        if(!id) {
            return false;
        }

        return this.fetchOne({
            knex: knex,
            where: {
                id: id,
                closed_at: { 'null': true }
            }
        });
    }


    getClosedCart(knex, id) {
        return this.fetchOne({
            knex: knex,
            where: {
                id: id,
                closed_at: { 'null': false }
            }
        })
    }


    async getOrCreateCart(knex, id) {
        const Cart = await this.getActiveCart(knex, id);

        if(Cart) {
            return Cart;
        }

        return this.upsertOne({
            knex: knex
        });
    }


    clearShippingRate(knex, id, fetchRelations) {
        return this.upsertOne({
            knex: knex,
            data: {
                id: id,
                selected_shipping_rate: null,
                shipping_rate_quote: null
            },
            fetchRelations: fetchRelations
        });
    }


    async getOrder(knex, id) {
        const Cart = await this.getClosedCart(knex, id);

        if(!Cart) {
            throw new Error('Cart not found')
        }

        const paymentData = await this.getPayment(knex, Cart.stripe_payment_intent_id);

        return {
            cart: Cart,
            payment: paymentData
        }
    }


    async getPayment(knex, stripe_payment_intent_id) {
        global.logger.info('REQUEST: CartService.getPayment', {
            meta: {
                stripe_payment_intent_id
            }
        });

        // Homoginizing the API response so it's the same
        // wether the payment was processed via Stripe or Paypal
        const paymentData = {
            amount: null,
            currency: null,
            payment_method_details: {}
        }

        if(!stripe_payment_intent_id) {
            return paymentData;
        }

        const stripePaymentIntent = await StripeApi.getPaymentIntent(knex, stripe_payment_intent_id);

        /*
        // SAMPLE PAYMENT INTENT RESPONSE
        {
            "id": "pi_0J3th3lUxEbdEgd3nL7YiqJV",
            "object": "payment_intent",
            "allowed_source_types": [
            "card"
            ],
            "amount": 1939,
            "amount_capturable": 0,
            "amount_received": 1939,
            "application": null,
            "application_fee_amount": null,
            "canceled_at": null,
            "cancellation_reason": null,
            "capture_method": "automatic",
            "charges": {
            "object": "list",
            "count": 1,
            "data": [
                {
                "id": "ch_0J3th4lUxEbdEgd3uHT4t0jL",
                "object": "charge",
                "amount": 1939,
                "amount_captured": 1939,
                "amount_refunded": 0,
                "application": null,
                "application_fee": null,
                "application_fee_amount": null,
                "balance_transaction": "txn_0J3th5lUxEbdEgd3saEkvZuK",
                "billing_details": {
                    "address": {
                    "city": "burlingame",
                    "country": "US",
                    "line1": "123 abc st",
                    "line2": null,
                    "postal_code": "94401",
                    "state": "CA"
                    },
                    "email": null,
                    "name": "robert labla",
                    "phone": null
                },
                "calculated_statement_descriptor": "Stripe",
                "captured": true,
                "card": null,
                "created": 1624068838,
                "currency": "usd",
                "customer": null,
                "description": null,
                "destination": null,
                "dispute": null,
                "disputed": false,
                "failure_code": null,
                "failure_message": null,
                "fee": 86,
                "fee_details": [
                    {
                    "amount": 86,
                    "amount_refunded": 0,
                    "application": null,
                    "currency": "usd",
                    "description": "Stripe processing fees",
                    "type": "stripe_fee"
                    }
                ],
                "fraud_details": {},
                "invoice": null,
                "livemode": false,
                "metadata": {},
                "on_behalf_of": null,
                "order": null,
                "outcome": {
                    "network_status": "approved_by_network",
                    "reason": null,
                    "risk_level": "normal",
                    "risk_score": 11,
                    "seller_message": "Payment complete.",
                    "type": "authorized"
                },
                "paid": true,
                "payment_intent": "pi_0J3th3lUxEbdEgd3nL7YiqJV",
                "payment_method": "pm_0J3th4lUxEbdEgd3HXALrCjJ",
                "payment_method_details": {
                    "card": {
                    "brand": "visa",
                    "checks": {
                        "address_line1_check": "pass",
                        "address_postal_code_check": "pass",
                        "cvc_check": "pass"
                    },
                    "country": "US",
                    "exp_month": 11,
                    "exp_year": 2022,
                    "fingerprint": "Gwiy8I00xFJzKCpN",
                    "funding": "credit",
                    "installments": null,
                    "last4": "4242",
                    "network": "visa",
                    "three_d_secure": null,
                    "wallet": null
                    },
                    "type": "card"
                },
                "receipt_email": null,
                "receipt_number": null,
                "receipt_url": "https://pay.stripe.com/receipts/lUxEbdEgd3sGdHsGqutxjTJ1DpfibSxo/ch_0J3th4lUxEbdEgd3uHT4t0jL/rcpt_JhIHXX5kT8SQifOjYTSaDHvHhxZEOKN",
                "refunded": false,
                "refunds": [],
                "review": null,
                "shipping": null,
                "source": null,
                "source_transfer": null,
                "statement_description": null,
                "statement_descriptor": null,
                "statement_descriptor_suffix": null,
                "status": "paid",
                "transfer_data": null,
                "transfer_group": null,
                "uncaptured": null
                }
            ],
            "has_more": false,
            "total_count": 1,
            "url": "/v1/charges?payment_intent=pi_0J3th3lUxEbdEgd3nL7YiqJV"
            },
            "client_secret": "pi_0J3th3lUxEbdEgd3nL7YiqJV_secret_3qvHqFK3JdIGoxjc3qwvUpAHt",
            "confirmation_method": "automatic",
            "created": 1624068837,
            "currency": "usd",
            "customer": null,
            "description": null,
            "invoice": null,
            "last_payment_error": null,
            "livemode": false,
            "metadata": {},
            "next_action": null,
            "next_source_action": null,
            "on_behalf_of": null,
            "payment_method": "pm_0J3th4lUxEbdEgd3HXALrCjJ",
            "payment_method_options": {
            "card": {
                "installments": null,
                "network": null,
                "request_three_d_secure": "automatic"
            }
            },
            "payment_method_types": [
            "card"
            ],
            "receipt_email": null,
            "review": null,
            "setup_future_usage": null,
            "shipping": null,
            "source": null,
            "statement_descriptor": null,
            "statement_descriptor_suffix": null,
            "status": "succeeded",
            "transfer_data": null,
            "transfer_group": null
        }
        */

        // Not everything needs to be returned to the client.
        // Cherry-picking only the data that seems most appropriate
        if(isObject(stripePaymentIntent)) {
            // The payment intent returns an array of charges,
            // but in our case I think it will never be more than one charge,
            // so im simplifying the response by simply returning data for the
            // first charge.
            const data = stripePaymentIntent.charges.data[0];

            paymentData.amount = data.amount;
            paymentData.currency = data.currency;
            paymentData.payment_method_details = data.payment_method_details;
        }

        global.logger.info('RESPONSE: CartService.getPayment', {
            meta: {
                paymentData
            }
        });

        return paymentData;
    }


    async sendPurchaseReceiptToBuyer(knex, id) {
        const Cart = await this.getClosedCart(knex, id);
        const Tenant = await this.TenantService.fetchAccount(knex, knex.userParams.tenant_id);

        if(!Cart) {
            throw new Error('Cart not found')
        }

        const orderTitle = this.getCartEmailTitle(Cart);

        const response = sendEmail({
            to: Cart.shipping_email,
            subject: `Your order from ${Tenant.application_name} - ${orderTitle}`,
            html: compileMjmlTemplate('purchase-receipt.mjml', {
                orderTitle,
                brandName: Tenant.application_name,
                baseUrl: Tenant.application_url,
                application_logo: Tenant.application_logo,
                id: Cart.id,
                shipping_name: Cart.shipping_fullName,
                shipping_address: Cart.shipping_streetAddress,
                sub_total: formatPrice(Cart.sub_total),
                shipping_total: formatPrice(Cart.shipping_total),
                sales_tax: formatPrice(Cart.sales_tax),
                grand_total: formatPrice(Cart.grand_total)
            })
        });

        return response;
    }


    getCartEmailTitle(Cart) {
        let remainingItems = 0;

        if(Array.isArray(Cart.cart_items)) {
            let totalNumItems = Cart.num_items;
            let firstItem = null;

            if(Cart.cart_items[0]?.product?.title) {
                firstItem = substringOnWords(Cart.cart_items[0].product.title);
                remainingItems = totalNumItems - 1;

                if(!remainingItems) {
                    return `"${firstItem}"`;
                }
            }

            let itemText = remainingItems === 1 ? 'item' : 'items';
            return `"${firstItem}" and ${remainingItems} more ${itemText}`;
        }

        return null;
    }


    async setShippingRate(knex, rateId, cartId) {
        let getRateResponse;

        if(rateId) {
            getRateResponse = await ShipEngineApi.getRate(knex, rateId);

            if(!getRateResponse) {
                throw new Error('A shipping rate for the given ID was not found')
            }
        }

        // Update the cart with the selected_shipping_rate
        // so the Cart.shipping_total virtual can return the rate
        // when creating the Stripe order
        if(getRateResponse) {
            await this.update({
                knex: knex,
                where: { id: cartId },
                data: { selected_shipping_rate: getRateResponse }
            });
        }

        // We can create an "Order" in Stripe now that the
        // subtotal and shipping amount are known.
        // The Stripe order will set the sales tax amount
        const stripeOrder = await this.createStripeOrderForCart(
            tenantId,
            request.payload.id
        );

        if(!stripeOrder) {
            throw new Error('Stripe Order returned null');
        }

        return this.update({
            knex: knex,
            where: { id: cartId },
            data: {
                stripe_order_id: stripeOrder.id,
                sales_tax: stripeOrder.total_details.amount_tax
            }
        });
    }



    async createStripeOrderForCart(knex, cartId) {
        global.logger.info('REQUEST: CartService.createStripeOrderForCart', {
            meta: { cartId }
        });

        const Cart = this.getActiveCart(knex, cartId);
        if(!Cart) {
            throw new Error('Cart not found');
        }

        /*
        * NOTES 8/5/22:
        * The 'currency' values set below must be hard-coded to 'USD'.
        * Since Prices in stripe must be created ahead of time
        * it doesn't seem feasable to create a Price object for each
        * currency type (USD, EUR, GBP, etc), especially since the way
        * I have designed it will pull the latest exchange rates periodically
        * (potentially invalidating the Price)
        * Is this OK, however?  Is it important from a customer perspective that
        * the price they are billed is their own currency?  I assume it is.
        *
        * I am creating Prices in Stripe in order to use Stripe Tax.   I wonder
        * if this might mean I need to switch to a service like TaxJar or Alavara that will
        * allow for sales tax calculation on the fly (I think), thus I wouild not need
        * to pre-create Price objects like this
        */
        const createConfig = {
            // currency: Cart.currency || 'usd',
            currency: 'usd',

            // https://stripe.com/docs/api/orders_v2/create#create_order_v2-line_items
            line_items: Cart?.cart_items.map((item) => {
                // Note: the Stripe "Price" has the product data included in it,
                // so there's no need to specify the 'product' in the API request.
                // In fact, only one 'price' or 'product' argument can be sent but not both
                return {
                    price: item.product_variant_sku.stripe_price_id,
                    quantity: item.qty
                }
            }),

            payment: {
                settings: {
                    payment_method_types: ['card']
                }
            },

            automatic_tax: {
                enabled: true
            },

            // https://stripe.com/docs/api/orders_v2/create#create_order_v2-shipping_details
            shipping_details: {
                name: Cart.shipping_fullName,
                address: {
                    city: Cart.shipping_city,
                    country: Cart.shipping_countryCodeAlpha2,
                    line1: Cart.shipping_streetAddress,
                    line2: Cart.shipping_extendedAddress,
                    postal_code: Cart.shipping_postalCode,
                    state: Cart.shipping_state
                }
            },

            // https://stripe.com/docs/api/orders_v2/create#create_order_v2-shipping_cost
            shipping_cost: {
                shipping_rate_data: {
                    display_name: 'Shipping rate',
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Cart.shipping_total,
                        // currency: Cart.currency || 'usd'
                        currency: 'usd'
                    },
                    tax_behavior: 'exclusive'
                }
            },

            // https://stripe.com/docs/api/orders_v2/create#create_order_v2-billing_details
            // This helps with "Risk Insights"
            billing_details: {
                address: {
                    city: Cart.billing_address.city,
                    country: Cart.billing_address.countryCodeAlpha2,
                    line1: Cart.billing_address.streetAddress,
                    line2: Cart.billing_address.extendedAddress,
                    postal_code: Cart.billing_address.postalCode,
                    state: Cart.billing_address.state
                },
                email: Cart.shipping_email,
                name: Cart.billing_fullName,
                phone: Cart.billing_same_as_shipping ? Cart.shipping_phone : Cart.billing_phone
            },

            expand: ['line_items']
        };

        global.logger.info('REQUEST: CartCtrl.createStripeOrderForCart - Stripe args', {
            meta: createConfig
        });

        const stripeOrder = await StripeApi.createOrder(knex, createConfig);

        global.logger.info('REQUEST: CartCtrl.createStripeOrderForCart - Stripe response', {
            meta: stripeOrder
        });

        return stripeOrder;
    }



    addRelations(knex, carts) {
        const CartItemSvc = new CartItemService();
        return CartItemSvc.addRelationToCarts(knex, carts);
    }


    addVirtuals(data) {
        makeArray(data).forEach((cart) => {
            // num_items
            cart.num_items = (function(obj) {
                let numItems = 0;

                makeArray(obj.cart_items).forEach((model) => {
                    numItems += parseInt(model.qty || 0, 10);
                });

                return numItems;
            })(cart);

            // weight_oz_total
            cart.weight_oz_total = (function(obj) {
                let weight = 0;

                makeArray(obj.cart_items).forEach((model) => {
                    weight += model.item_weight_total || 0;
                });

                return weight;
            })(cart);

            // sub_total
            cart.sub_total = (function(obj) {
                let subtotal = 0;

                makeArray(obj.cart_items).forEach((model) => {
                    subtotal += model.item_price_total || 0;
                });

                return subtotal;
            })(cart);

            // shipping_total
            cart.shipping_total = (function(obj) {
                const selectedRate = obj.selected_shipping_rate;
                let total = 0;

                if(isObject(selectedRate)) {
                    total += selectedRate.shipping_amount?.amount ? selectedRate.shipping_amount.amount * 100 : 0;
                    total += selectedRate.other_amount?.amount ? selectedRate.other_amount.amount * 100 : 0;
                    total += selectedRate.insurance_amount?.amount ? selectedRate.insurance_amount.amount * 100 : 0;
                    total += selectedRate.confirmation_amount?.amount ? selectedRate.confirmation_amount.amount * 100 : 0;
                }

                return total;
            })(cart);

            // grand_total
            cart.grand_total = (function(obj) {
                return (obj.sub_total || 0) + (obj.sales_tax || 0) + (obj.shipping_total || 0);
            })(cart);

            // tax_rate
            cart.tax_rate = (function(obj) {
                const salesTax = obj.sales_tax || 0;
                const grandTotal = obj.grand_total;

                if(!salesTax || !grandTotal) {
                    return null;
                }

                const preTaxGrandTotal = grandTotal - salesTax;
                return (salesTax / preTaxGrandTotal).toFixed(5);
            })(cart);

            // shipping_fullName
            cart.shipping_fullName = (function(obj) {
                return makeFullName(obj.shipping_firstName, obj.shipping_lastName)
            })(cart);

            // billing_fullName
            cart.billing_fullName = (function(obj) {
                if(obj.billing_same_as_shipping) {
                    return obj.shipping_fullName;
                }

                return makeFullName(obj.billing_firstName, obj.billing_lastName)
            })(cart);

            // billing_address
            cart.billing_address = (function(obj) {
                const prefix = obj.billing_same_as_shipping ? 'shipping' : 'billing';

                return {
                    firstName: obj[`${prefix}_firstName`],
                    lastName: obj[`${prefix}_lastName`],
                    streetAddress: obj[`${prefix}_streetAddress`],
                    extendedAddress: obj[`${prefix}_extendedAddress`],
                    city: obj[`${prefix}_city`],
                    state: obj[`${prefix}_state`],
                    postalCode: obj[`${prefix}_postalCode`],
                    countryCodeAlpha2: obj[`${prefix}_countryCodeAlpha2`],
                    phone: obj[`${prefix}_phone`]
                }
            })(cart);
        });

        return data;
    }


    getProductWeight(productId, cart) {
        let weight = 0;

        if(Array.isArray(cart.cart_items)) {
            cart.cart_items.forEach((obj) => {
                if(obj.product.id === productId) {
                    const variantSkuWeight = isObject(obj.product_variant_sku) ? parseFloat(obj.product_variant_sku.weight_oz || 0) : 0;

                    if(variantSkuWeight) {
                        weight = variantSkuWeight;
                    }
                }
            })
        }

        return weight;
    }


    getProductArrayFromCart(cart) {
        if(!isObject(cart)) {
            return;
        }

        const products = [];

        cart.cart_items?.forEach((cartItem) => {
            for(let i=0; i<cartItem.qty; i++) {

                // need to stuff the product_variant and product_variant_sku into the
                // product object so all of the data related to the object is included in
                // the packing results.  Need SKU info in order to fulfill the order... without
                // the sku we wouldn't know what to pack in the box when fulfilling orders.
                products.push({
                    ...cartItem.product,
                    product_variant: cartItem.product_variant,
                    product_variant_sku: cartItem.product_variant_sku
                });
            }
        });

        return products;
    }


    // getValidationSchemaForAdd() {
    //     return {
    //         ...super.getValidationSchemaForAdd(),
    //         billing_same_as_shipping: schema.billing_same_as_shipping.default(true)
    //     }
    // }


    getValidationSchemaForUpdate() {
        const schema = {
            ...super.getValidationSchemaForUpdate()
        }
        schema.billing_same_as_shipping = schema.billing_same_as_shipping.default(true);
        return schema;
    }

    getValidationSchemaForShippingAddress() {
        return this.model.shippingAddressSchema;
    }


    getValidationSchemaForSelectShippingRate() {
        return {
            ...this.getValidationSchemaForId(),
            rate_id: Joi.string().allow(null)
        }
    }

}
