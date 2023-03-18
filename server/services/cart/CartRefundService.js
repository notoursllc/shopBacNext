import BaseService from '../BaseService.js';
import CartRefundDao from '../../db/dao/cart/CartRefundDao.js';
import StripeService from '../StripeService.js';
// import TenantService from '../TenantService.js';
import CartService from './CartService.js';


export default class CartRefundService extends BaseService {

    constructor() {
        super(new CartRefundDao());
        this.StripeService = new StripeService();
        // this.TenantService = new TenantService();
        this.CartService = new CartService();
    }


    async getCartRefundSummary(knex, cart_id) {
        /*
        * Note: this also could have been written as:
        * .select('cart_id', this.server.app.knex.raw('SUM(total_refund) AS total'))
        */
        const results = await knex
            .select('cart_id')
            .sum({ total: 'total_refund' })
            .from(this.dao.tableName)
            .where('cart_id', cart_id)
            .groupBy('cart_id');

        return results[0] || { cart_id: cart_id, total: 0 };
    }


    async addRefund(knex, data) {
        const Cart = await this.CartService.getClosedCart(knex, data.cart_id);
        if(!Cart) {
            throw new Error('Cart not found');
        }

        let refundAmount = 0;
        refundAmount += data.subtotal_refund || 0;
        refundAmount += data.shipping_refund || 0;
        refundAmount += data.tax_refund || 0;

        if(Cart.grand_total < refundAmount) {
            throw new Error('Refund amount must be less than the Cart total');
        }

        // If refunds have previously been given for this Cart,
        // then this new refund must be <= the remainder of the
        // Cart.grand_total - total of previously given refunds
        const refundSummary = await this.getCartRefundSummary(knex, data.cart_id);
        const previousRefundTotal = parseInt(refundSummary.total, 10) || 0;
        const availableRefund = parseInt(Cart.grand_total) - previousRefundTotal;

        if(refundAmount > availableRefund) {
            throw new Error('Refund amount is greater than the remaining funds available for this cart.');
        }

        // This shouldn't happen, but checking just in case I guess
        if(!Cart.stripe_payment_intent_id) {
            global.logger.error(
                `CartCtrl.getOrderHandler - can not process refund because the Cart did not contain a stripe_payment_intent_id value`, {
                meta: Cart
            });
            throw new Error('Error processing refund');
        }

        // Process the refund via Stripe
        const stripe = await this.StripeService.getStripe(knex);
        const stripeArgs = {
            payment_intent: Cart.stripe_payment_intent_id,
            amount: refundAmount,
            reason: ['duplicate', 'fraudulent', 'requested_by_customer'].includes(data.reason) ? data.reason : 'requested_by_customer',
            metadata: data.description
                ? { cart: Cart.id, refund_desc: data.description }
                : null
        }

        global.logger.info('REQUEST: stripe.refunds.create', {
            meta: stripeArgs
        });

        const stripeRefund = await stripe.refunds.create(stripeArgs);

        global.logger.info('RESPONSE: stripe.refunds.create', {
            meta: stripeRefund
        });

        return this.upsertOne({
            knex: knex,
            data: {
                cart_id: data.cart_id,
                subtotal_refund: data.subtotal_refund,
                shipping_refund: data.shipping_refund,
                tax_refund: data.tax_refund,
                reason: data.reason,
                description: data.description,
                stripe_refund_id: stripeRefund.id || null,
            }
        });
    }


    getValidationSchemaForAdd() {
        const schema = {
            ...super.getValidationSchemaForAdd(),
            cart_id: this.dao.schema.cart_id.required()
        };
        delete schema.stripe_refund_id;
        return schema;
    }


    getValidationSchemaForUpdate() {
        const schema = {
            ...super.getValidationSchemaForUpdate(),
            cart_id: this.dao.schema.cart_id.required()
        };
        delete schema.stripe_refund_id;
        return schema;
    }


    getValidationSchemaForRefundSummary() {
        return {
            cart_id: this.dao.schema.cart_id.required()
        }
    }

}
