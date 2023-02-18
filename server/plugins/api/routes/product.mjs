import ProductController from '../../../controllers/product/ProductController.js';

const ProductCtrl = new ProductController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/products',
            options: {
                description: 'Finds a Hero object by ID',
                // auth: {
                //     strategies: ['storeauth', 'session']
                // },
                // validate: {
                //     query: Joi.object({
                //         id: Joi.string().uuid(),
                //         tenant_id: Joi.string().uuid()
                //     })
                // },
                handler: (request, h) => {
                    return ProductCtrl.getProducts(request, h)
                }
            }
        }
    ]);
}
