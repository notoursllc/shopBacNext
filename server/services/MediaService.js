import Joi from 'joi';
import MediaDao from '../db/dao/MediaDao.js';
import BaseService from './BaseService.js';
import BunnyAPI from './BunnyAPI.js';

export default class MediaService extends BaseService {

    constructor() {
        super(new MediaDao());
    }


    uploadImage(file) {
        return BunnyAPI.storage.imageUpload(`${Date.now()}-${file.filename}`, file);
    }


    async addImage(knex, data) {
        const payload = { ...data };

        if(payload.file) {
            payload.url = await this.uploadImage(payload.file);
        }

        delete payload.file;
        payload.resource_type = 'IMAGE';

        return this.dao.create({
            knex: knex,
            data: payload
        });
    }


    async deleteImage(knex, id) {
        const currentMedia = await this.fetchOne({
            knex: knex,
            where: { id }
        });

        if(currentMedia.url) {
            await BunnyAPI.storage.del(currentMedia.url);
        }

        return this.dao.del({
            knex: knex,
            where: { id }
        });
    }


    uploadVideo(file) {
        return BunnyAPI.video.upload(file.path, `${Date.now()}-${file.filename}`);
    }


    async addVideo(knex, data) {
        const payload = { ...data };

        if(payload.file) {
            const videoUploadResponse = await this.uploadVideo(payload.file);
            payload.url = videoUploadResponse?.directPlayUrl || null;
            payload.third_party_id = videoUploadResponse?.id || null;
        }

        delete payload.file;
        payload.resource_type = 'VIDEO';

        const res = this.dao.create({
            knex: knex,
            data: payload
        });

        res.streamLibraryId = process.env.BUNNY_API_STREAM_LIBRARY_ID;
        return res;
    }


    async deleteVideo(knex, id) {
        const currentMedia = await this.fetchOne({
            knex: knex,
            where: { id }
        });

        if(currentMedia.third_party_id) {
            await BunnyAPI.video.del(currentMedia.third_party_id);
        }

        return this.dao.del({
            knex: knex,
            where: { id }
        });
    }


    getValidationSchemaForAdd() {
        const schemaCopy = super.getValidationSchemaForAdd();
        schemaCopy.file = Joi.object();

        return schemaCopy;
    }


    // getValidationSchemaForUpdate() {
    //     const schemaCopy = super.getValidationSchemaForUpdate();
    //     schemaCopy.file = Joi.object();

    //     return schemaCopy;
    // }

}
