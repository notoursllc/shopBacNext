import Joi from 'joi';
import PackageTypeController from '../../../controllers/PackageTypeController.js';
import PackageTypeService from '../../../services/PackageTypeService.js';

const PackageTypeCtrl = new PackageTypeController();
const PackageTypeSvc = new PackageTypeService();


export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/package_types',
            options: {
                description: 'Gets a list of package types',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...PackageTypeSvc.dao.getPaginationSchema(),
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/package_type',
            options: {
                description: 'Gets a package type by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...PackageTypeSvc.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/package_type',
            options: {
                description: 'Adds a new package type',
                validate: {
                    payload: Joi.object({
                        ...PackageTypeSvc.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.createHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/package_type',
            options: {
                description: 'Updates a package type',
                validate: {
                    payload: Joi.object({
                        ...PackageTypeSvc.getIdValidationSchema(),
                        ...PackageTypeSvc.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.updateByIdHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/package_types/ordinal',
            options: {
                description: 'Bulk update package type ordinals',
                validate: {
                    payload: Joi.object({
                        ...PackageTypeSvc.getUpdateOrdinalsValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.bulkUpdateOrdinalsHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/package_type',
            options: {
                description: 'Deletes a package type by ID',
                validate: {
                    payload: Joi.object({
                        ...PackageTypeSvc.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.deleteHandler(request, h);
                }
            }
        },

    ]);
}
