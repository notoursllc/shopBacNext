import Joi from 'joi';
import CartItemController from '../../../controllers/cart/CartItemController.js';

const CartItemCtrl = new CartItemController();

export default (server) => {
    server.route([
        {
            method: 'POST',
            path: '/cart/item',
            options: {
                description: 'Adds an item to Cart',
                auth: {
                    strategies: ['storeauth']
                },
                validate: {
                    payload: Joi.object({
                        ...CartItemCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return CartItemCtrl.createHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/cart/item',
            options: {
                description: 'Updates a CartItem',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartItemCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return CartItemCtrl.updateHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/cart/item',
            options: {
                description: 'Removes an item from the cart',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...CartItemCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return CartItemCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
