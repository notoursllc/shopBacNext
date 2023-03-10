import Joi from 'joi';
import ProductColorSwatchController from '../../../controllers/product/ProductColorSwatchController.js';

const ProductColorSwatchCtrl = new ProductColorSwatchController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/product/color_swatches',
            options: {
                description: 'Gets a list of product color swatches',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductColorSwatchCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return ProductColorSwatchCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/product/color_swatch',
            options: {
                description: 'Gets a product color swatch by ID',
                validate: {
                    query: Joi.object({
                        ...ProductColorSwatchCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductColorSwatchCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/product/color_swatch',
            options: {
                description: 'Adds a new product color swatch',
                validate: {
                    payload: Joi.object({
                        ...ProductColorSwatchCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return ProductColorSwatchCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/product/color_swatch',
            options: {
                description: 'Updates a product color swatch',
                validate: {
                    payload: Joi.object({
                        ...ProductColorSwatchCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return ProductColorSwatchCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/product/color_swatch',
            options: {
                description: 'Deletes a product color swatch',
                validate: {
                    payload: Joi.object({
                        ...ProductColorSwatchCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductColorSwatchCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
