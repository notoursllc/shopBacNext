
import Joi from 'joi';
import BaseService from '../BaseService.js';
import CartService from './CartService.js';
import ProductService from '../product/ProductService.js';
import ProductVariantService from '../product/ProductVariantService.js';
import ProductVariantSkuService from '../product/ProductVariantSkuService.js';
import CartItemDao from '../../db/dao/cart/CartItemDao.js';
import { makeArray } from '../../utils/index.js';

export default class CartItemService extends BaseService {

    constructor() {
        super(new CartItemDao());
        this.ProductService = new ProductService();
        this.ProductVariantService = new ProductVariantService();
        this.ProductVariantSkuService = new ProductVariantSkuService();
    }


    async create(knex, data) {
        // NOTE: this.CartService can not be in the constructor
        // because it will result in an infinite loop because
        // CartItemService is in the constructor of CartService
        const CartSvc = new CartService();

        // Fetch the SKU to make sure it exists
        // and also fetch the Cart
        const [ ProductVariantSku, Cart ] = await Promise.all([
            this.ProductVariantSkuService.fetchOne({
                knex: knex,
                where: { id: data.product_variant_sku_id },
                fetchRelations: false
            }),
            CartSvc.getOrCreateCart(knex, data.cart_id)
        ]);

        if(!ProductVariantSku) {
            throw new Error('SKU does not exist');
        }
        if(!Cart) {
            throw new Error('Cart does not exist');
        }

        // Fetch the ProductVariant
        const ProductVariant = await this.ProductVariantService.fetchOne({
            knex: knex,
            where: { id: ProductVariantSku.product_variant_id },
            fetchRelations: false
        });
        if(!ProductVariant) {
            throw new Error('ProductVariant does not exist');
        }

        // Fetch the Product
        const Product = await this.ProductService.fetchOne({
            knex: knex,
            where: { id: ProductVariant.product_id },
            fetchRelations: false
        });
        if(!Product) {
            throw new Error('Product does not exist');
        }

        // If there are cart items, then check to see if we have reached
        // the max qty for the product we are adding
        const lookup = {};

        if(Array.isArray(Cart.cart_items)) {
            Cart.cart_items.forEach((CartItem) => {
                const productId = CartItem.product?.id;

                if(productId) {
                    if(!lookup.hasOwnProperty(productId)) {
                        lookup[productId] = 0;
                    }
                    lookup[productId] += parseInt(CartItem.qty, 10);
                }
            });
        }

        // If by adding the new qty the 'CART_PRODUCT_QUANTITY_LIMIT' value is exceeded
        // then throw an error;
        const quantity = parseInt(data.qty, 10);

        if(lookup[Product.id]
            && (lookup[Product.id] + quantity) > parseInt(process.env.CART_PRODUCT_QUANTITY_LIMIT, 10)) {
            throw new Error('INVALID_QUANTITY');
        }

        // If the list of cart items already contains this SKU,
        // then update the qty of the existing cart SKU instead of adding a duplicate SKU
        let existingCartItem = null;

        // To prevent duplicate cart items (skus) being added to the cart:
        if(Array.isArray(Cart.cart_items)) {
            Cart.cart_items.forEach((CartItem) => {
                if(CartItem.product_variant_sku?.id === ProductVariantSku.id) {
                    existingCartItem = CartItem;
                }
            });
        }

        // If a matching CartItem was found then we use it's ID
        // so the qty gets updated.  Otherwise a new CartItem will be created
        return knex.transaction(async trx => {
            await this.upsertOne({
                knex: trx,
                data: {
                    id: existingCartItem?.id || null,
                    qty: existingCartItem?.qty ? parseInt(existingCartItem.qty, 10) + quantity : quantity,
                    cart_id: Cart.id,
                    product: Product,
                    product_variant: ProductVariant,
                    product_variant_sku: ProductVariantSku
                }
            });

            // Clear the shipping rate data in the Cart since the items have changed
            // and therefore postage rate no longer accruate
            // and return the updated Cart
            return CartSvc.clearShippingRate(trx, Cart.id);
        });
    }


    /**
     * Update the qty of a CartItem in a Cart
     *
     * @param {*} knex
     * @param {*} data
     * @returns
     */
    async update(knex, id, qty) {
        const CartItem = await this.fetchOne({
            knex: knex,
            where: { id },
            fetchRelations: false
        });

        if(!CartItem) {
            throw new Error('CartItem does not exist');
        }

        const requestQty = await this.reduceRequestedCartItemQtyIfExceededProductLimit(knex, CartItem.cart_id, id, qty);

        return knex.transaction(async trx => {
            // Update the CartItem qty value
            await this.dao.update({
                knex: trx,
                where: { id },
                data: { qty: requestQty }
            });

            // Clear the selected_shipping_rate value since the cart has changed
            const CartSvc = new CartService();
            return CartSvc.clearShippingRate(trx, CartItem.cart_id);
        });
    }


    /**
     * Delete a CartItem from a Cart
     *
     * @param {*} knex
     * @param {*} data
     * @returns
     */
    async del(knex, id) {
        const CartItem = await this.fetchOne({
            knex: knex,
            where: { id },
            fetchRelations: false
        });

        if(!CartItem) {
            throw new Error('CartItem does not exist');
        }

        return knex.transaction(async trx => {
            await this.dao.del({
                knex: trx,
                where: { id }
            });

            // Clear the selected_shipping_rate value since the cart has changed
            const CartSvc = new CartService();
            return CartSvc.clearShippingRate(trx, CartItem.cart_id);
        });
    }


    async reduceRequestedCartItemQtyIfExceededProductLimit(knex, cartId, cartItemId, requestedCartItemQty) {
        const CartSvc = new CartService();
        let requestedCartItemQuantity = parseInt(requestedCartItemQty, 10);

        const [ Cart, CartItem ] = await Promise.all([
            CartSvc.fetchOne({
                knex: knex,
                where: { id: cartId }
            }),
            this.fetchOne({
                knex: knex,
                where: { id: cartItemId }
            })
        ]);

        if(!Cart) {
            throw new Error('Cart does not exist');
        }
        if(!CartItem) {
            throw new Error('CartItem does not exist');
        }

        const lookup = {};

        Cart.cart_items.forEach((obj) => {
            const productId = obj.product.id;

            if(!lookup.hasOwnProperty(productId)) {
                lookup[productId] = 0;
            }

            // add the 'new' quantity if the id from the request mathces the obj id
            lookup[productId] += obj.id === cartItemId
                ? requestedCartItemQuantity
                : parseInt(obj.qty, 10);
        });

        // if the lookup prod is over the max then that will tell us how much
        // we need to trim from the request
        const pid = CartItem.product.id;
        const exceeded = lookup[pid] - parseInt(process.env.CART_PRODUCT_QUANTITY_LIMIT, 10);

        if(exceeded > 0) {
            requestedCartItemQuantity -= exceeded;
        }

        return requestedCartItemQuantity;
    }


    /**
     * Adds variant relation to a list of carts
     *
     * @param {*} knex
     * @param {*} carts
     * @returns []
     */
    async addRelationToCarts(knex, carts) {
        await this.dao.addRelations(
            carts,
            'id',
            knex.select(this.dao.getAllColumns()).from(this.dao.tableName).whereNull('deleted_at'),
            'cart_id',
            'cart_items'
        );

        makeArray(carts).forEach((cart) => {
            this.dao.addVirtuals(cart.cart_items);
        });

        return carts;
    }


    getValidationSchemaForUpdate() {
        const schema = { ...this.dao.schema };

        return {
            id: schema.id.required(),
            qty: schema.qty.required()
        }
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };

        schema.product_variant_sku_id = Joi.string().uuid().required();
        schema.cart_id = schema.cart_id.required();

        delete schema.product;
        delete schema.product_variant;
        delete schema.product_variant_sku;
        delete schema.fulfilled_at;

        return schema;
    }

}
