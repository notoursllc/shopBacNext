import Joi from 'joi';
import BaseDao from './BaseDao.js';


export default class ExchangeRateDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.exchange_rates;
        this.hidden = [];
        this.schema = {
            id: Joi.string().uuid().allow(null),
            base: Joi.string(),
            rates: Joi.alternatives().try(
                Joi.object(),
                Joi.allow(null)
            ),
            created_at: Joi.date(),
            updated_at: Joi.date()
        }
    }

}
