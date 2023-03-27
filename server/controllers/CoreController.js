import Boom from '@hapi/boom';
import robotstxt from 'generate-robotstxt';
// import { createSitemap } from 'sitemap';
// import { createReadStream } from 'fs';
import BaseController from './BaseController.js';
import ProductService from '../services/product/ProductService.js';

export default class CoreController extends BaseController {

    constructor() {
        super();
        this.ProductService = new ProductService();
    }


    async appConfigHandler(request, h) {
        try {
            // const data = await ProductService.search(
            //     request.knex,
            //     request.query
            // );

            // return h.apiSuccess(data);
            return h.apiSuccess({ test: 'appconfig test'});
        }
        catch(err) {
            // global.logger.error(err);
            // global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    async healthzHandler(request, h) {
        try {
            const result = await this.ProductService.fetchOne({
                knex: request.knex,
                columns: ['created_at'],
                where: { 'id': { 'ne':'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' } }
            });

            if(!result) {
                throw new Error('Health check: Error getting product.');
            }

            const response = h.response('success');
            response.type('text/plain');
            return response;
        }
        catch(err) {
            throw Boom.badRequest(err);
        }
    }


    /**
     * Generates a robots.txt. file
     * https://moz.com/learn/seo/robotstxt
     * https://www.robotstxt.org/
     *
     * @param {*} request
     * @param {*} h
     */
    async robotsHandler(request, h) {
        try {
            const host = `http://www.${process.env.DOMAIN_NAME}`;

            const robotsText = await robotstxt({
                policy: [
                    {
                        userAgent: '*',
                        allow: '/',
                        disallow: [
                            '/cart/*',
                            '/order/*'
                        ],
                        crawlDelay: 2
                    },
                    {
                        userAgent: 'Nutch',
                        disallow: '/'
                    }
                ],
                sitemap: `${host}/sitemap.xml`,
                host: host
            });

            return h.response(robotsText).type('text/plain');
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }


    // TODO: needs work

    async sitemapHandler(request, h) {
        return h.apiSuccess({ test: 'sitemapHandler test'});

        try {
        // https://www.sitemaps.org/protocol.html
            const sitemapConfig = {
                hostname: `http://www.${process.env.DOMAIN_NAME}`,
                cacheTime: 600000, // 600 sec - cache purge period
                urls: [
                    { url: '/returns/', changefreq: 'monthly', priority: 0.5 },
                    { url: '/contact-us/', changefreq: 'monthly', priority: 0.5 },
                    { url: '/privacy/', changefreq: 'monthly', priority: 0.5 },
                    { url: '/conditions-of-use/', changefreq: 'monthly', priority: 0.5 }
                ]
            };

            const ProductService = new ProductService();
            const Products = await ProductService.search({
                knex: request.knex
            });

            if(Products) {
                Products.forEach((obj) => {
                    const prod = {
                        url: `/q/${obj.seo_uri}`,
                        changefreq: 'weekly',
                        priority: 1
                    };

                    // const imageUrl = this.featuredProductPic(obj);
                    // if(imageUrl) {
                    //     prod.img = [
                    //         {
                    //             url: imageUrl,
                    //             title: obj.title ? obj.title.trim() : '',
                    //         }
                    //     ]
                    // }

                    sitemapConfig.urls.push(prod);
                });
            }

            const sitemap = createSitemap(sitemapConfig);
            const xml = sitemap.toXML();

            return h.response(xml).type('application/xml')
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw Boom.badRequest(err);
        }
    }

}
