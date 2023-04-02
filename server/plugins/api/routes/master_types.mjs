import Joi from 'joi';
import MasterTypeController from '../../../controllers/MasterTypeController.js';

const MasterTypeCtrl = new MasterTypeController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/master_types',
            options: {
                description: 'Gets a list of master types',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...MasterTypeCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/master_type',
            options: {
                description: 'Gets an master type by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...MasterTypeCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/master_type',
            options: {
                description: 'Adds a new master type',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...MasterTypeCtrl.service.getValidationSchemaForAdd(),
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.addMasterTypeHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/master_type',
            options: {
                description: 'Updates master type',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...MasterTypeCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.updateMasterTypeHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/master_types/ordinal',
            options: {
                description: 'Bulk update master type ordinals',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...MasterTypeCtrl.service.getValidationSchemaForUpdateOrdinals()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.bulkUpdateOrdinalsHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/master_type',
            options: {
                description: 'Deletes a master type',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...MasterTypeCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
