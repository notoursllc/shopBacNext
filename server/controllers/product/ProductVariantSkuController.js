import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductVariantSkuService from '../../services/product/ProductVariantSkuService.js';

export default class ProductVariantSkuController extends BaseController {

    constructor() {
        super(new ProductVariantSkuService());
    }


    async deleteHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductVariantSkuController.deleteHandler', {
                meta: request.payload
            });

            await this.throwIfNotFound(request.knex, request.payload.id);

            const response = await this.service.del(request.knex, request.payload.id);

            global.logger.info('RESPONSE: ProductVariantSkuController.deleteHandler', {
                meta: response[1]
            });

            return h.apiSuccess(request.payload.id);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
