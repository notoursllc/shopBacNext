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

            const Product = await this.service.getProduct(request.knex, request.query.id);

            if(!Product) {
                throw Boom.notFound();
            }

            global.logger.info('RESPONSE: ProductController.getProductHandler', {
                meta: Product
            });

            return h.apiSuccess(Product);
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


    async upsertHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.upsertHandler', {
                meta: request.payload
            });

            const response = await this.service.upsert(request.knex, request.payload);

            global.logger.info('RESPONSE: ProductController.upsertHandler', {
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


    async deleteHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductController.deleteHandler', {
                meta: request.payload
            });

            await this.throwIfNotFound(request.knex, request.payload.id)

            const response = await this.service.del(request.knex, request.payload.id);

            global.logger.info('RESPONSE: ProductController.deleteHandler', {
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
