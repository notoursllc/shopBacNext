import CoreController from '../../../controllers/CoreController.js';

const CoreCtrl = new CoreController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/app_config',
            options: {
                // auth: false,
                // auth: {
                //     strategies: ['storeauth']
                // },
                description: 'Returns public app config info',
                handler: (request, h) => {
                    return CoreCtrl.appConfigHandler(request, h);
                }
            }
        },
        // {
        //     method: 'POST',
        //     path: 'logger',
        //     options: {
        //         description: 'Logs stuff',
        //         validate: {
        //             payload: Joi.object({
        //                 type: Joi.string(),
        //                 message: Joi.string()
        //             })
        //         },
        //         handler: (request, h) => {
        //             return CoreCtrl.loggerHandler(request, h);
        //         }
        //     }
        // },
        {
            method: 'GET',
            path: '/healthz',
            options: {
                auth: false,
                description: 'Simple health check',
                handler: (request, h) => {
                    // return CoreCtrl.healthzHandler(h);
                }
            }
        },
        {
            method: 'GET',
            path: '/robots.txt', // NOTE: no routePrefix on this one
            options: {
                auth: false,
                description: 'For generating robots.txt',
            },
            handler: (request, h) => {
                // return CoreCtrl.robotsHandler(h);
            }
        }
    ]);
}
