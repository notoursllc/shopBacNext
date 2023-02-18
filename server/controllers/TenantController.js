import Joi from 'joi';
import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import TenantService from '../services/TenantService.js';

export default class TenantController extends BaseController {

    constructor() {
        super();
        this.TenantService = new TenantService();
    }


    async contactUsHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.contactUsHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const response = await this.TenantService.fetchById(
                request.knex,
                this.TenantService.getTenantIdFromAuth(request)
            );

            if(!response) {
                throw new Error('Tenant can not be found');
            }

            this.TenantService.sendContactUsEmailToAdmin({
                ...request.payload,
                application_name: response.application_name,
            });

            global.logger.info('RESPONSE: TenantController.contactUsHandler', {
                meta: response
            });

            return h.apiSuccess();
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async exchangeRatesHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.exchangeRatesHandler', {
                meta: {}
            });

            const rates = await this.TenantService.getSupportedCurrenyRates(request.knex);

            global.logger.info(`RESPONSE: TenantController.exchangeRatesHandler`, {
                meta: { rates }
            });

            return h.apiSuccess(rates);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.notFound(err);
        }
    }


    contactUsHandlerRequestValidation() {
        return Joi.object({
            name: Joi.string().trim().max(100).required(),
            company: Joi.alternatives().try(Joi.string().trim().max(100), Joi.allow(null)),
            email: Joi.string().trim().max(100).required(),
            message: Joi.string().trim().max(10000).required(),
            // tenant_id: Joi.string().uuid()
        });
    }

}
