import Stripe from 'stripe';
import TenantService from './TenantService.js';

const TenantSvc = new TenantService();


async function getStripe(knex) {
    const Tenant = await TenantSvc.fetchOne({
        knex: knex,
        where: { id: TenantSvc.getTenantIdFromKnex(knex) },
        columns: ['stripe_key']
    });

    if(!Tenant) {
        throw new Error('Unable to obtain Tenant');
    }
    if(!Tenant.stripe_key) {
        throw new Error('Unable to obtain stripe key for Tenant');
    }

    return new Stripe(Tenant.stripe_key, { apiVersion: '2012-03-25; orders_beta=v3'});
}


/*
* https://stripe.com/docs/api/tax_codes/list?p=t
*/
async function getTaxCodes(knex) {
    const stripe = await getStripe(knex);
    const taxCodes = await stripe.taxCodes.list({
        limit: 999
    });

    return taxCodes?.data;
}


// Note:
// Products can not be deleted if it has a Price attached to it (which ours do)
// so instead we mark it as active=false
async function archiveProduct(knex, stripe_product_id) {
    if(!stripe_product_id) {
        return;
    }

    const stripe = await getStripe(knex);
    return stripe.products.update(stripe_product_id, { active: false });
}


async function createPrice(knex, data) {
    const stripe = await getStripe(knex);
    return stripe.prices.create({
        currency: 'USD',
        tax_behavior: 'exclusive', // https://stripe.com/docs/tax/products-prices-tax-codes-tax-behavior#tax-behavior
        ...data
    });
}


// Note:
// Prices can not be deleted in Stripe.
// Instead, they should be marked as active=false
// Good explanation about this here:
// https://github.com/stripe/stripe-python/issues/658
async function archivePrice(knex, stripe_price_id) {
    if(!stripe_price_id) {
        return;
    }

    const stripe = await getStripe(knex);
    return stripe.prices.update(stripe_price_id, { active: false });
}


async function createRefund(knex, data) {
    const stripe = await getStripe(knex);
    return stripe.refunds.create(data);
}


async function getPaymentIntent(knex, id) {
    const stripe = await getStripe(knex);
    return stripe.paymentIntents.retrieve(id);
}


async function createOrder(knex, data) {
    const stripe = await getStripe(knex);
    return stripe.orders.create(data);
}


async function submitOrder(knex, stripeOrderId, expectedTotal) {
    const stripe = await getStripe(knex);

    const resource = stripe.StripeResource.extend({
        request: stripe.StripeResource.method({
            method: 'POST',
            path: `orders/${stripeOrderId}/submit`
        })
    });

    const requestData = {
        expected_total: expectedTotal,
        expand: ['payment.payment_intent']
    }

    // Logging this so I can see the 'expected_total' arg being passed to Stripe
    // because sometimes I get this error:
    // "The `expected_total` you passed does not match the order's current `amount_total`. This probably means something else concurrently modified the order."
    global.logger.info('REQUEST: StripeApi.submitOrder - stripe args', {
        meta: {
            stripeArgs: requestData,
            stripe_order_id: stripeOrderId
        }
    });

    return new resource(stripe).request(requestData);
}


export default {
    getTaxCodes,
    archiveProduct,
    createPrice,
    archivePrice,
    createRefund,
    getPaymentIntent,
    createOrder,
    submitOrder
}
