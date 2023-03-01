import Joi from 'joi';
import ProductController from '../../../controllers/product/ProductController.js';

const ProductCtrl = new ProductController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/products',
            options: {
                description: 'Gets a list of products',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return ProductCtrl.getProducts(request, h)
                }
            }
        }
    ]);
}
