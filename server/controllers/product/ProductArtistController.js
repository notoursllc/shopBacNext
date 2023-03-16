import BaseController from '../BaseController.js';
import ProductArtistService from '../../services/product/ProductArtistService.js';

export default class ProductArtistController extends BaseController {

    constructor() {
        super(new ProductArtistService());
    }


    async upsertHandler(request, h) {
        try {
            global.logger.info('REQUEST: ProductArtistController.upsertHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Media = await this.service.upsertArtist(
                request.knex,
                request.payload
            );

            global.logger.info('RESONSE: ProductArtistController.upsertHandler', {
                meta: Media
            });

            return h.apiSuccess(Media);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
