import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductVariantService from '../../services/product/ProductVariantService.js';

export default class ProductVariantController extends BaseController {

    constructor() {
        super(new ProductVariantService());
    }


    async deleteImageHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ProductVariantController.deleteImageHandler`, {
                meta: request.payload
            });

            await this.throwIfNotFound(request.knex, request.payload.id);

            const response = await this.service.deleteImage(
                request.knex,
                request.payload.id,
                request.payload.media_id
            );

            global.logger.info(`RESPONSE: ProductVariantController.deleteImageHandler`, {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw err;
        }
    }

}
