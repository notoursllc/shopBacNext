import Joi from 'joi';
import ProductAccentMessageController from '../../../controllers/product/ProductAccentMessageController.js';

const ProductAccentMessageCtrl = new ProductAccentMessageController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/product/accent_messages',
            options: {
                description: 'Search product accent messages',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductAccentMessageCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return ProductAccentMessageCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/product/accent_message',
            options: {
                description: 'Gets a product color swatch by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductAccentMessageCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductAccentMessageCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/product/accent_message',
            options: {
                description: 'Adds a new product accent message',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductAccentMessageCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return ProductAccentMessageCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/product/accent_message',
            options: {
                description: 'Updates a product accent message',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductAccentMessageCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return ProductAccentMessageCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/accent_message',
            options: {
                description: 'Deletes a product accent message',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductAccentMessageCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductAccentMessageCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
