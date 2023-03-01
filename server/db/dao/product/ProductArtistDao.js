import Joi from 'joi';
import BaseDao from '../BaseDao.js';


export default class ProductArtistDao extends BaseDao {

    constructor() {
        super();
        this.tableName = this.tables.product_artists;
        this.hidden = ['tenant_id'];
        this.schema = {
            id: Joi.string().uuid(),
            tenant_id: Joi.string().uuid(),
            published: Joi.boolean(),
            is_global: Joi.boolean(),
            name: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            description: Joi.alternatives().try(
                Joi.string().trim(),
                Joi.allow(null)
            ),
            website: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            city: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            state: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            countryCodeAlpha2: Joi.alternatives().try(
                Joi.string().trim().max(2),
                Joi.allow(null)
            ),
            image: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            alt_text: Joi.alternatives().try(
                Joi.string().trim().max(100),
                Joi.allow(null)
            ),
            created_at: Joi.date(),
            updated_at: Joi.date(),
            deleted_at: Joi.date()
        }
    }

}
