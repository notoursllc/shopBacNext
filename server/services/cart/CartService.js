import isObject from 'lodash.isobject';
import BaseService from '../BaseService.js';
import CartDao from '../../db/dao/cart/CartDao.js';
import CartItemsService from './CartItemsService.js';
import StripeService from '../StripeService.js';
import TenantService from '../TenantService.js';
import { sendEmail, compileMjmlTemplate } from '../email/EmailService.js';
import { substringOnWords, formatPrice } from '../../utils/index.js';


export default class CartService extends BaseService {

    constructor() {
        super(new CartDao());
        this.CartItemsService = new CartItemsService();
        this.StripeService = new StripeService();
        this.TenantService = new TenantService();
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
        global.logger.info('REQUEST: CartCtrl.getPayment', {
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

        const stripe = await this.StripeService.getStripe(knex);
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);

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

        global.logger.info('RESPONSE: CartCtrl.getPayment', {
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


    addRelations(knex, carts) {
        return this.CartItemsService.addRelationToCarts(knex, carts)
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
    //     const schema = { ...super.getValidationSchemaForAdd() };
    //     schema.message = schema.message.required();

    //     return schema;
    // }


    // getValidationSchemaForUpdate() {
    //     const schema = { ...super.getValidationSchemaForUpdate() };
    //     schema.message = schema.message.required();

    //     return schema;
    // }

    getValidationSchemaForShippingAddress() {
        return this.dao.shippingAddressSchema;
    }

}
