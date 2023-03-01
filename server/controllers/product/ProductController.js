import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductService from '../../services/product/ProductService.js';

export default class ProductController extends BaseController {

    constructor() {
        super(new ProductService());
    }


    async getProductsHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.getProductsHandler', {
                meta: {
                    query: request.query
                }
            });

            const data = await this.service.getProducts(request.knex, request.query);

            global.logger.info('RESPONSE: ProductController.getProductsHandler', {
                meta: {
                    numProducts: data.data.length
                }
            });

            return h.apiSuccess(data);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async getProductHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.getProductHandler', {
                meta: {
                    query: request.query
                }
            });

            const product = await this.service.getProduct(request.knex, request.query.id);

            global.logger.info('RESPONSE: ProductController.getProductHandler', {
                meta: product
            });

            return h.apiSuccess(product);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
