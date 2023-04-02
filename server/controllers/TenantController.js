import Joi from 'joi';
import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import TenantService from '../services/TenantService.js';

export default class TenantController extends BaseController {

    constructor() {
        super(new TenantService());
    }


    async contactUsHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.contactUsHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const response = await this.service.fetchOne({
                knex: request.knex,
                where: { id: request.knex.userParams.tenant_id }
            });

            if(!response) {
                throw new Error('Tenant can not be found');
            }

            this.service.sendContactUsEmailToAdmin({
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

            const rates = await this.service.getSupportedCurrenyRates(request.knex);

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
                meta: request.payload
            });

            const Tenant = await this.service.updateTenant(
                request.knex,
                this.service.getTenantIdFromKnex(request.knex),
                request.payload
            );

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

            const Tenant = await this.service.updateApiKey(
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

            const Tenant = await this.service.removeApiKey(
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

            const Account = await this.service.fetchAccount(request.knex, request.knex.userParams.tenant_id);

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


    async appConfigHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantController.appConfigHandler', {
                meta: request.query
            });

            const result = await this.service.getAppConfig(request.knex)

            global.logger.info('RESPONSE: TenantController.appConfigHandler', {
                meta: result
            });

            return h.apiSuccess(result);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
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
