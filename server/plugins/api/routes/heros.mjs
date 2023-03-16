import Joi from 'joi';
import HeroController from '../../../controllers/HeroController.js';

const HeroCtrl = new HeroController();
const payloadConfig = {
    // output: 'stream',
    output: 'file',
    parse: true,
    allow: 'multipart/form-data',
    maxBytes: process.env.ROUTE_PAYLOAD_MAXBYTES || 10485760,
    multipart: true
};

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/hero',
            options: {
                description: 'Finds a Hero object by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...HeroCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return HeroCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/heros',
            options: {
                description: 'Gets a list of Heros',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...HeroCtrl.service.getValidationSchemaForPagination(),
                    })
                },
                handler: (request, h) => {
                    return HeroCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/hero',
            options: {
                description: 'Adds a new Hero',
                auth: {
                    strategies: ['session']
                },
                payload: payloadConfig,
                validate: {
                    payload: Joi.object({
                        ...HeroCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return HeroCtrl.addHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/hero',
            options: {
                description: 'Updates a Hero',
                auth: {
                    strategies: ['session']
                },
                payload: payloadConfig,
                validate: {
                    payload: Joi.object({
                        ...HeroCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return HeroCtrl.updateHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/heros/ordinal',
            options: {
                description: 'Updates Hero ordinals',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...HeroCtrl.service.getValidationSchemaForUpdateOrdinals()
                    })
                },
                handler: (request, h) => {
                    return HeroCtrl.bulkUpdateOrdinalsHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/hero',
            options: {
                description: 'Deletes a Hero',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...HeroCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return HeroCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
