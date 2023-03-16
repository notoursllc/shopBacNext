import Joi from 'joi';
import ProductVariantController from '../../../controllers/product/ProductVariantController.js';

const ProductVariantCtrl = new ProductVariantController();

export default (server) => {
    server.route([
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
                        ...ProductVariantCtrl.service.getIdValidationSchema()
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
