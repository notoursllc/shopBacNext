import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductService from '../../services/product/ProductService.js';
import StripeService from '../../services/StripeService.js';

export default class ProductController extends BaseController {

    constructor() {
        super(new ProductService());
        this.StripeService = new StripeService();
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


    async getStripeTaxCodesHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.getStripeTaxCodesHandler', {});

            const taxCodes = await this.StripeService.getTaxCodes(request.knex);

            global.logger.info('RESPONSE: ProductController.getStripeTaxCodesHandler', {
                meta: taxCodes
            });

            return h.apiSuccess(taxCodes);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async createHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.createHandler', {
                meta: request.payload
            });

            const response = await this.service.create(request.knex, request.payload);

            global.logger.info('RESPONSE: ProductController.createHandler', {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
