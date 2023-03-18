import Joi from 'joi';
import ProductArtistController from '../../../controllers/product/ProductArtistController.js';

const ProductArtistCtrl = new ProductArtistController();
const payloadMaxBytes = process.env.ROUTE_PAYLOAD_MAXBYTES || 10485760; // 10MB (1048576 (1 MB) is the default)

export default (server) => {
    server.route([
        {
            method: 'GET',
            path: `/product/artists`,
            options: {
                description: 'Gets a list of product artist',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductArtistCtrl.service.getValidationSchemaForSearch()
                    })
                },
                handler: (request, h) => {
                    return ProductArtistCtrl.searchHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/product/artist',
            options: {
                description: 'Gets a product artist by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...ProductArtistCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductArtistCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/product/artist',
            options: {
                description: 'Adds a new product artist',
                auth: {
                    strategies: ['session']
                },
                payload: {
                    // output: 'stream',
                    output: 'file',
                    parse: true,
                    allow: 'multipart/form-data',
                    maxBytes: payloadMaxBytes,
                    multipart: true
                },
                validate: {
                    payload: Joi.object({
                        ...ProductArtistCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return ProductArtistCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: `/product/artist`,
            options: {
                description: 'Updates a product artist',
                auth: {
                    strategies: ['session']
                },
                payload: {
                    // output: 'stream',
                    output: 'file',
                    parse: true,
                    allow: 'multipart/form-data',
                    maxBytes: payloadMaxBytes,
                    multipart: true
                },
                validate: {
                    payload: Joi.object({
                        ...ProductArtistCtrl.service.getValidationSchemaForUpdate()
                    })
                },
                handler: (request, h) => {
                    return ProductArtistCtrl.upsertHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: `/product/artist`,
            options: {
                description: 'Deletes a product artist',
                auth: {
                    strategies: ['session']
                },
                validate: {
                    payload: Joi.object({
                        ...ProductArtistCtrl.service.getValidationSchemaForId()
                    })
                },
                handler: (request, h) => {
                    return ProductArtistCtrl.deleteHandler(request, h);
                }
            }
        }
    ]);
}
