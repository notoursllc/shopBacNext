import Boom from '@hapi/boom';
import BaseController from './BaseController.js';
import HeroService from '../services/HeroService.js';


export default class HeroController extends BaseController {

    constructor() {
        super(new HeroService());
    }


    async addHandler(request, h) {
        try {
            global.logger.info('REQUEST: HeroController.addHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Hero = await this.service.addHero(
                request.knex,
                request.payload
            );

            global.logger.info('RESONSE: HeroController.addHandler', {
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


    async updateHandler(request, h) {
        try {
            global.logger.info('REQUEST: HeroController.updateHandler', {
                meta: {
                    payload: request.payload
                }
            });

            const Hero = await this.service.updateHero(
                request.knex,
                request.payload
            );

            global.logger.info('RESONSE: HeroController.updateHandler', {
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

}
