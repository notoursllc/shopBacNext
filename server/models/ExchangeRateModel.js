import Joi from 'joi';
import BaseModel from './BaseModel.js';


export default class ExchangeRateModel extends BaseModel {

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
