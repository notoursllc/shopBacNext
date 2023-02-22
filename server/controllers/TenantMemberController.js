import Joi from 'joi';
import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import TenantMemberService from '../services/TenantMemberService.js';

export default class TenantMemberController extends BaseController {

    constructor() {
        super();
        this.TenantMemberService = new TenantMemberService();
    }


    async createHandler(request, h) {
        try {
            global.logger.info('REQUEST: TenantMemberController.createHandler', {
                meta: request.payload
            });

            const response = await this.TenantMemberService.dao.create({
                knex: request.knex,
                data: request.payload
            });

            global.logger.info('RESPONSE: TenantMemberController.createHandler', {
                meta: {
                    member: response
                }
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async loginHandler(request, h) {
        global.logger.info('REQUEST: TenantMemberController.loginHandler', {
            meta: {
                payload: request.payload
            }
        });

        let TenantMember;
        try {
            TenantMember = await this.TenantMemberService.login(
                request.knex,
                request.payload.email,
                request.payload.password
            );
        }
        catch(err) {
            throw Boom.unauthorized();
        }

        try {
            this.TenantMemberService.setCookieOnRequest(request, TenantMember.id);

            global.logger.info('RESPONSE: TenantMemberController.loginHandler', {
                meta: TenantMember
            });

            return h.apiSuccess();
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    logoutHandler(request, h) {
        global.logger.info('REQUEST: TenantMemberController.logoutHandler', {
            meta: {
                payload: request.payload
            }
        });

        try {
            request.cookieAuth.clear();

            global.logger.info('RESPONSE: TenantMemberController.logoutHandler', {
                meta: {}
            });

            return h.apiSuccess();
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    createMemberRequestValidation() {
        return Joi.object({
            email: Joi.string().max(100).required(),
            password: Joi.string().max(100).required(),
            active: Joi.boolean().default(true)
        });
    }


    loginRequestValidation() {
        return Joi.object({
            email: Joi.string().max(100).required(),
            password: Joi.string().max(100).required()
        });
    }

}
