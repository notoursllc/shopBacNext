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

            const response = await this.TenantService.dao.fetchOne({
                knex: request.knex,
                where: { id: this.TenantService.getTenantIdFromAuth(request) }
            });

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


    async updateHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController:updateHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Tenant = await this.TenantService.update(
                request.knex,
                request.knex.userParams.tenant_id,
                request.payload
            )

            global.logger.info('RESPONSE: TenantController:updateHandler', {
                meta: Tenant
            });

            return h.apiSuccess(Tenant);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async updateApiKeyHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.updateApiKeyHandler', {});

            const Tenant = await this.TenantService.updateApiKey(
                request.knex,
                request.knex.userParams.tenant_id
            );

            global.logger.info('RESPONSE: TenantController.updateApiKeyHandler', {
                meta: Tenant
            });

            return h.apiSuccess(Tenant);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.notFound(err);
        }
    }


    async deleteApiKeyHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.deleteApiKeyHandler', {});

            const Tenant = await this.TenantService.removeApiKey(
                request.knex,
                request.knex.userParams.tenant_id
            );

            global.logger.info(`RESPONSE: TenantController.deleteApiKeyHandler`, {
                meta: Tenant
            });

            return h.apiSuccess(Tenant);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.notFound(err);
        }
    }


    async fetchAccountHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.fetchAccountHandler', {
                meta: {
                    query: request.query
                }
            });

            const Account = await this.TenantService.fetchAccount(request.knex, request.knex.userParams.tenant_id);

            if(!Account) {
                return h.apiSuccess();
            }

            global.logger.info(`RESPONSE: TenantController.fetchAccountHandler`, {
                meta: Account
            });

            return h.apiSuccess(Account);
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
