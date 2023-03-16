import Joi from 'joi';
import ProductDataTableController from '../../../controllers/product/ProductDataTableController.js';

const ProductDataTableCtrl = new ProductDataTableController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/product/data_tables',
            options: {
                description: 'Gets a list of product data tables',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductDataTableCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return ProductDataTableCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/product/data_table',
            options: {
                description: 'Gets a product data table by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductDataTableCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductDataTableCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/product/data_table',
            options: {
                description: 'Adds a new product data table',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductDataTableCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return ProductDataTableCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/product/data_table',
            options: {
                description: 'Updates a product data table',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductDataTableCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return ProductDataTableCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/data_table',
            options: {
                description: 'Deletes a product data table',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductDataTableCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductDataTableCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
