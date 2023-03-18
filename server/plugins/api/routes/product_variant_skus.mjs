import Joi from 'joi';
import ProductVariantSkuController from '../../../controllers/product/ProductVariantSkuController.js';

const ProductVariantSkuCtrl = new ProductVariantSkuController();

export default (server) => {
    server.route([
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
