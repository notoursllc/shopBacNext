import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import MediaService from '../services/MediaService.js';


export default class MediaController extends BaseController {

    constructor() {
        super(new MediaService());
    }


    async addImageHandler(request, h) {
        try {
            global.logger.info('REQUEST: MediaController.addHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Media = await this.service.addImage(
                request.knex,
                request.payload
            );

            global.logger.info('RESONSE: MediaController.addHandler', {
                meta: Media
            });

            return h.apiSuccess(Media);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async deleteImageHandler(request, h) {
        try {
            global.logger.info('REQUEST: MediaController.deleteImageHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Hero = await this.service.deleteImage(
                request.knex,
                request.payload.id
            );

            global.logger.info('RESONSE: MediaController.deleteImageHandler', {
                meta: Hero
            });

            return h.apiSuccess(Hero);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async addVideoHandler(request, h) {
        try {
            global.logger.info('REQUEST: MediaController.addVideoHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Media = await this.service.addVideo(
                request.knex,
                request.payload
            );

            global.logger.info('RESONSE: MediaController.addVideoHandler', {
                meta: Media
            });

            return h.apiSuccess(Media);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async deleteVideoHandler(request, h) {
        try {
            global.logger.info('REQUEST: MediaController.deleteVideoHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const response = await this.service.deleteVideo(
                request.knex,
                request.payload.id
            );

            global.logger.info('RESONSE: MediaController.deleteVideoHandler', {
                meta: response
            });

            return h.apiSuccess(response);
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
