import Joi from 'joi';
import MasterTypeController from '../../../controllers/MasterTypeController.js';
import MasterTypeService from '../../../services/MasterTypeService.js';

const MasterTypeCtrl = new MasterTypeController();
const MasterTypeSvc = new MasterTypeService();


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
                        ...MasterTypeSvc.dao.getPaginationSchema(),
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
                validate: {
                    query: Joi.object({
                        ...MasterTypeSvc.getIdValidationSchema()
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
                validate: {
                    payload: Joi.object({
                        ...MasterTypeSvc.getValidationSchemaForAdd(),
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.createHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/master_type',
            options: {
                description: 'Updates master type',
                validate: {
                    payload: Joi.object({
                        ...MasterTypeSvc.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.updateByIdHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/master_types/ordinal',
            options: {
                description: 'Bulk update master type ordinals',
                validate: {
                    payload: Joi.object({
                        ...MasterTypeSvc.getValidationSchemaForUpdateOrdinals()
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
                validate: {
                    payload: Joi.object({
                        ...MasterTypeSvc.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return MasterTypeCtrl.deleteHandler(request, h);
                }
            }
        }


    ]);
}
