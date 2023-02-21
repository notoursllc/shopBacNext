import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import PackageTypeService from '../services/PackageTypeService.js';

export default class PackageTypeController extends BaseController {

    constructor() {
        super();
        this.PackageTypeService = new PackageTypeService();
    }


    async searchHandler(request, h) {
        try {
            global.logger.info('REQUEST: PackageTypeController.searchHandler', {
                meta: {
                    query: request.query
                }
            });

            const PackageTypes = await this.PackageTypeService.dao.search(request.knex, request.query);

            global.logger.info('RESPONSE: PackageTypeController.searchHandler', {
                meta: {
                    num_results: PackageTypes?.data?.length
                }
            });

            return h.apiSuccess(PackageTypes);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async getOneHandler(request, h) {
        try {
            global.logger.info('REQUEST: PackageTypeController.getOneHandler', {
                meta: {
                    query: request.query
                }
            });

            const PackageType = await this.PackageTypeService.dao.fetchOne(
                request.knex,
                { id: request.query.id }
            );

            global.logger.info('RESPONSE: PackageTypeController.getOneHandler', {
                meta: PackageType
            });

            return h.apiSuccess(PackageType);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
