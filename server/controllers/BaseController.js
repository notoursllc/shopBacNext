import Boom from '@hapi/boom';
import isString from 'lodash.isstring';

export default class BaseController {

    constructor(service) {
        this.service = service;
    }


    getControllerName() {
        return this.constructor.name
    }


    async throwIfNotFound(knex, id) {
        const Model = await this.service.fetchOne({
            knex: knex,
            where: { id }
        });

        if(!Model) {
            throw Boom.notFound();
        }

        return Model;
    }


    async getByIdHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getControllerName()}.getByIdHandler`, {
                meta: {
                    query: request.query
                }
            });

            const response = await this.service.fetchOne({
                knex: request.knex,
                where: { id: request.query.id }
            });

            global.logger.info(`RESPONSE: ${this.getControllerName()}.getByIdHandler`, {
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


    async upsertHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getControllerName()}.upsertHandler`, {
                meta: request.payload
            });

            if(request.payload.id) {
                await this.throwIfNotFound(request.knex, request.payload.id);
            }

            const response = await this.service.upsertOne({
                knex: request.knex,
                data: request.payload
            });

            global.logger.info(`RESPONSE: ${this.getControllerName()}.upsertHandler`, {
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
            global.logger.info(`REQUEST: ${this.getControllerName()}.searchHandler`, {
                meta: {
                    query: request.query
                }
            });

            const response = await this.service.search({
                knex: request.knex,
                where: request.query
            });

            global.logger.info(`RESPONSE: ${this.getControllerName()}.searchHandler`, {
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
            global.logger.info(`REQUEST: ${this.getControllerName()}.deleteHandler`, {
                meta: request.payload
            });

            await this.throwIfNotFound(request.knex, request.payload.id);

            const response = await this.service.del({
                knex: request.knex,
                where: { id: request.payload.id }
            });

            global.logger.info(`RESPONSE: ${this.getControllerName()}.deleteHandler`, {
                meta: response
            });

            return h.apiSuccess(request.payload.id);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async bulkUpdateOrdinalsHandler(request, h) {
        try {
            global.logger.info(`REQUEST: ${this.getControllerName()}.bulkUpdateOrdinalsHandler`, {
                meta: request.payload.ordinals
            });

            const promises = [];
            const ordinals = isString(request.payload.ordinals)
                ? JSON.parse(request.payload.ordinals)
                : [...request.payload.ordinals];

            ordinals.forEach((obj) => {
                promises.push(
                    this.service.update({
                        knex: request.knex,
                        where: { id: obj.id },
                        data: { ordinal: obj.ordinal },
                        columns: [ 'id', 'ordinal' ]
                    })
                );
            });

            const response = await Promise.all(promises);

            global.logger.info(`RESPONSE: ${this.getControllerName()}.bulkUpdateOrdinalsHandler`);

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
