import CoreController from '../../../controllers/CoreController.js';

const CoreCtrl = new CoreController();

export default (server) => {
    server.route([

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
                    return CoreCtrl.healthzHandler(request, h);
                }
            }
        }
    ]);
}
