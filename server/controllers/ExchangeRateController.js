import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import ExchangeRateService from '../services/exchange_rate/ExchangeRateService.js';

export default class ExchangeRateController extends BaseController {

    constructor() {
        super(new ExchangeRateService());
    }


    async fetchRateHandler(request, h, fetchConfig) {
        try {
            global.logger.info('REQUEST: ExchangeRateController.fetchRateHandler', {
                meta: {
                    fetchConfig
                }
            });

            const ExchangeRate = await this.service.fetchRate(request.knex);

            global.logger.info('RESPONSE: ExchangeRateController.fetchRateHandler', {
                meta: ExchangeRate
            });

            return h.apiSuccess(ExchangeRate);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.notFound(err);
        }
    }


    async refreshRateHandler(request, h) {
        try {
            global.logger.info('REQUEST: ExchangeRateController.refreshRateHandler', {
                meta: {}
            });

            const latestRates = await this.service.pullLatestRates(request.knex);

            global.logger.info('RESPONSE: ExchangeRateController.refreshRateHandler', {
                meta: {
                    rate: latestRates
                }
            });

            return h.apiSuccess(latestRates);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.notFound(err);
        }
    }

}
