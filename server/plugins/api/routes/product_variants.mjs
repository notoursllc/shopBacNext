import Joi from 'joi';
import ProductVariantController from '../../../controllers/product/ProductVariantController.js';

const ProductVariantCtrl = new ProductVariantController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/product/variant',
            options: {
                description: 'Gets a product variant',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductVariantCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductVariantCtrl.getByIdHandler(request, h)
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/variant',
            options: {
                description: 'Deletes a product variant',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductVariantCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductVariantCtrl.deleteHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/variant/image',
            options: {
                description: 'Deletes a product variant image',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductVariantCtrl.service.getValidationSchemaForDelete()
                    })
                },
                handler: (request, h) => {
                    return ProductVariantCtrl.deleteImageHandler(request, h);
                }
            }
        }
    ]);
}
