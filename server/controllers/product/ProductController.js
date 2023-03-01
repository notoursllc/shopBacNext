import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductService from '../../services/product/ProductService.js';

export default class ProductController extends BaseController {

    constructor() {
        super(new ProductService());
    }


    async getProducts(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.getProducts', {
                meta: {
                    query: request.query
                }
            });

            const data = await this.service.getProducts(request.knex, request.query);

            global.logger.info('RESPONSE: ProductController.getProducts', {
                meta: {
                    numProducts: data.data.length
                }
            });

            return h.apiSuccess(data);
        }
        catch(err) {
            // global.logger.error(err);
            // global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
