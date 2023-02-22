import Boom from '@hapi/boom';

export default class BaseController {

    constructor(service) {
        this.service = service;
    }


    getServiceName() {
        return this.service?.constructor.name
    }


    async getByIdHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getServiceName()}.getOneHandler`, {
                meta: {
                    query: request.query
                }
            });

            const response = await this.service.dao.fetchOne(
                request.knex,
                { id: request.query.id }
            );

            global.logger.info(`RESPONSE: ${this.getServiceName()}.getOneHandler`, {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async createHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getServiceName()}.createHandler`, {
                meta: request.payload
            });

            const response = await this.service.dao.tenantCreate(request.knex, request.payload);

            global.logger.info(`RESPONSE: ${this.getServiceName()}.createHandler`, {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async updateByIdHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getServiceName()}.updateHandler`, {
                meta: request.payload
            });

            const response = await this.service.dao.tenantUpdate({
                knex: request.knex,
                where: { id: request.payload.id },
                data: request.payload,
            });

            global.logger.info(`RESPONSE: ${this.getServiceName()}.updateHandler`, {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async searchHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getServiceName()}.searchHandler`, {
                meta: {
                    query: request.query
                }
            });

            const response = await this.service.dao.search(request.knex, request.query);

            global.logger.info(`RESPONSE: ${this.getServiceName()}.searchHandler`, {
                meta: {
                    num_results: response?.data?.length
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


    async deleteHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getServiceName()}.deleteHandler`, {
                meta: request.payload
            });

            const response = await this.service.dao.del(
                request.knex,
                { id: request.payload.id }
            );

            global.logger.info(`RESPONSE: ${this.getServiceName()}.deleteHandler`, {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
