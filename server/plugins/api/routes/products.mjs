import Joi from 'joi';
import ProductController from '../../../controllers/product/ProductController.js';

const ProductCtrl = new ProductController();
const payloadMaxBytes = process.env.ROUTE_PAYLOAD_MAXBYTES || 10485760; // 10MB (1048576 (1 MB) is the default)
const productUpsertMaxBytes = 1000000000; // 1 gb

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
                    return ProductCtrl.getProductsHandler(request, h)
                }
            }
        },
        {
            method: 'GET',
            path: '/product',
            options: {
                description: 'Gets a product',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return ProductCtrl.getProductHandler(request, h)
                }
            }
        },
        {
            method: 'GET',
            path: '/product/tax_codes',
            options: {
                description: 'Returns a list of Stripe tax codes',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                handler: (request, h) => {
                    return ProductCtrl.getStripeTaxCodesHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/product',
            options: {
                description: 'Creates a product',
                payload: {
                //     // output: 'stream',
                //     output: 'file',
                //     parse: true,
                //     allow: 'multipart/form-data',
                //     multipart: true,
                    maxBytes: productUpsertMaxBytes,
                },
                validate: {
                    payload: Joi.object({
                        ...ProductCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return ProductCtrl.createHandler(request, h);
                }
            }
        },
    ]);
}
