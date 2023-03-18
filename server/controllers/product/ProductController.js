import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductService from '../../services/product/ProductService.js';
import StripeService from '../../services/StripeService.js';

export default class ProductController extends BaseController {

    constructor() {
        super(new ProductService());
        this.StripeService = new StripeService();
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

}
