import Joi from 'joi';
import ProductVariantSkuController from '../../../controllers/product/ProductVariantSkuController.js';

const ProductVariantSkuCtrl = new ProductVariantSkuController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/product/variant/sku',
            options: {
                description: 'Gets a SKU',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductVariantSkuCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductVariantSkuCtrl.getByIdHandler(request, h)
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/variant/sku',
            options: {
                description: 'Deletes a SKU',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductVariantSkuCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductVariantSkuCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
