import BaseController from './BaseController.js';
import MasterTypeService from '../services/MasterTypeService.js';

export default class MasterTypeController extends BaseController {

    constructor() {
        super(new MasterTypeService());
    }


    async addMasterTypeHandler(request, h) {
        try {
            global.logger.info('REQUEST: MasterTypeController.addMasterTypeHandler', {
                meta: request.payload
            });

            const MasterType = await this.service.addMasterType(request.knex, request.payload);

            global.logger.info('RESPONSE: MasterTypeController.addMasterTypeHandler', {
                meta: MasterType
            });

            return h.apiSuccess(MasterType);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async updateMasterTypeHandler(request, h) {
        try {
            global.logger.info('REQUEST: MasterTypeController.updateMasterTypeHandler', {
                meta: request.payload
            });

            const MasterType = await this.service.update({
                knex: request.knex,
                data: request.payload,
                where: { id: request.payload.id }
             });

            global.logger.info('RESPONSE: MasterTypeController.updateMasterTypeHandler', {
                meta: MasterType
            });

            return h.apiSuccess(MasterType);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
