import ExchangeRateModel from '../../models/ExchangeRateModel.js';
import BaseService from '../BaseService.js';
import { getLatestOpenExchangeRates } from './OpenExchangeRatesService.js';

export default class ExchangeRateService extends BaseService {

    constructor() {
        super(new ExchangeRateModel());
    }


    async pullLatestRates(knex) {
        const data = await getLatestOpenExchangeRates();

        if(data.error) {
            global.logger.error(data.description);
            global.bugsnag(data.description);
            return;
        }

        // There will only ever be one entry in this table.
        // Right now I dont see the value in keeping historical data
        // about every exchange rate as long as the exchange rate used is persisted in the cart
        try {
            await this.del({
                knex: knex,
                where: { id: 1 }
            });
        }
        catch(err) {
            // drop the error
        }

        return this.create({
            knex: knex,
            data:  {
                id: 1,
                base: data.base,
                rates: data.rates
            }
        });
    }


    fetchRate(knex) {
        return this.fetchOne({
            knex: knex,
            where: { id: 1 }
        });
    }

}
