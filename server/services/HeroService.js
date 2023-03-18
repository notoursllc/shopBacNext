import Joi from 'joi';
import HeroDao from '../db/dao/HeroDao.js';
import BaseService from './BaseService.js';
import BunnyAPI from './BunnyAPI.js';

export default class HeroService extends BaseService {

    constructor() {
        super(new HeroDao());
    }


    uploadImage(file) {
        return BunnyAPI.storage.imageUpload(`${Date.now()}-${file.filename}`, file);
    }


    async deleteHeroImage(knex, id) {
        const currentHero = await this.fetchOne({
            knex: knex,
            where: { id }
        });

        if(currentHero.url) {
            return BunnyAPI.storage.del(currentHero.url);
        }
    }


    async addHero(knex, data) {
        const payload = { ...data };

        if(payload.file) {
            payload.url = await this.uploadImage(payload.file);
        }

        delete payload.file;

        return this.dao.create({
            knex: knex,
            data: payload
        });
    }


    async updateHero(knex, data) {
        const payload = { ...data };

        if(payload.file) {
            await this.deleteHeroImage(knex, payload.id);
            payload.url = await this.uploadImage(payload.file);
        }

        delete payload.file;

        return this.dao.update({
            knex: knex,
            where: { id: data.id },
            data: payload,
        });
    }


    deleteRelations(knex, id) {
        return this.deleteHeroImage(knex, id);
    }


    getValidationSchemaForAdd() {
        const schemaCopy = super.getValidationSchemaForAdd();
        schemaCopy.file = Joi.object();

        return schemaCopy;
    }


    getValidationSchemaForUpdate() {
        const schemaCopy = super.getValidationSchemaForUpdate();
        schemaCopy.file = Joi.object();

        return schemaCopy;
    }

}
