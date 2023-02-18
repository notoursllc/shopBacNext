import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
// const ProductService = require('../../services/product/ProductService.js')

export default class ProductController extends BaseController {

    constructor() {
        super();
        // this.ProductService = new ProductService();
    }


    async getProducts(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.getProducts', {
                meta: {
                    query: request.query
                }
            });

            // const data = await ProductService.getProducts(
            //     request.knex,
            //     request.query
            // );

            // global.logger.info('RESPONSE: ProductController.getProducts', {
            //     meta: {
            //         numProducts: data.data.length
            //     }
            // });

            // return h.apiSuccess(data);
            return h.apiSuccess({ test: 'test2'});
        }
        catch(err) {
            // global.logger.error(err);
            // global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
