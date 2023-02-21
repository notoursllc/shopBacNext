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
                        ...PackageTypeSvc.getSinglePackageTypeValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return PackageTypeCtrl.getOneHandler(request, h);
                }
            }
        },

    ]);
}
