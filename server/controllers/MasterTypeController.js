import Boom from '@hapi/boom';
import isString from 'lodash.isstring';
import BaseController from './BaseController.js';
import MasterTypeService from '../services/MasterTypeService.js';

export default class MasterTypeController extends BaseController {

    constructor() {
        super(new MasterTypeService());
    }


    async bulkUpdateOrdinalsHandler(request, h) {
        try {
            global.logger.info('REQUEST: MasterTypeController.bulkUpdateOrdinalsHandler', {
                meta: request.payload.ordinals
            });

            const promises = [];
            const ordinals = isString(request.payload.ordinals)
                ? JSON.parse(request.payload.ordinals)
                : [...request.payload.ordinals];

            ordinals.forEach((obj) => {
                promises.push(
                    this.service.dao.update({
                        knex: request.knex,
                        where: { id: obj.id },
                        data: { ordinal: obj.ordinal },
                        returning: [ 'id', 'ordinal' ]
                    })
                );
            });

            const response = await Promise.all(promises);

            global.logger.info('RESPONSE: MasterTypeController.bulkUpdateOrdinalsHandler');

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
