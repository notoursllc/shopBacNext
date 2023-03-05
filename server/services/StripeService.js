import Stripe from 'stripe';
import TenantService from './TenantService.js';

export default class StripeService {

    constructor() {
        this.TenantService = new TenantService();
    }


    async getStripe(knex) {
        const Tenant = await this.TenantService.fetchAccount(knex, knex.tenant_id);

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
    async getTaxCodes(knex) {
        const stripe = await this.getStripe(knex);
        const taxCodes = await stripe.taxCodes.list({
            limit: 999
        });

        return taxCodes?.data;
    }


    // Note:
    // Products can not be deleted if it has a Price attached to it (which ours do)
    // so instead we mark it as active=false
    async archiveProduct(knex, stripe_product_id) {
        const stripe = await this.getStripe(knex);
        return stripe.products.update(stripe_product_id, { active: false });
    }


    async createPrice(knex, data) {
        const stripe = await this.getStripe(knex);
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
    async archivePrice(knex, stripe_price_id) {
        const stripe = await this.getStripe(knex);
        return stripe.prices.update(stripe_price_id, { active: false });
    }

}
