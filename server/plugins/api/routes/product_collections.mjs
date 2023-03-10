import Joi from 'joi';
import ProductCollectionController from '../../../controllers/product/ProductCollectionController.js';

const ProductCollectionCtrl = new ProductCollectionController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/product/collections',
            options: {
                description: 'Gets a list of product collections',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductCollectionCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return ProductCollectionCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/product/collection',
            options: {
                description: 'Gets a product collection by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductCollectionCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductCollectionCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/product/collection',
            options: {
                description: 'Adds a new product collection',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductCollectionCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return ProductCollectionCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/product/collection',
            options: {
                description: 'Updates a product collection',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductCollectionCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return ProductCollectionCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/collection',
            options: {
                description: 'Deletes a product collection',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductCollectionCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductCollectionCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
