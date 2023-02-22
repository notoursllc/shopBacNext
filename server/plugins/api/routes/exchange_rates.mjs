import Joi from 'joi';
import ExchangeRateController from '../../../controllers/ExchangeRateController.js';

const ExchangeRateCtrl = new ExchangeRateController();

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/exchange_rate',
            options: {
                description: 'Gets the current ExchangeRate',
                auth: {
                    strategies: ['session']
                },
                handler: (request, h) => {
                    return ExchangeRateCtrl.fetchRateHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/exchange_rate',
            options: {
                description: 'Refreshes the ExchangeRate',
                auth: {
                    strategies: ['cronauth']
                },
                handler: (request, h) => {
                    return ExchangeRateCtrl.refreshRateHandler(request, h);
                }
            }
        }
    ]);
}
