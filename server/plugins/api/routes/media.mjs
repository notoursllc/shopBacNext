import Joi from 'joi';
import MediaController from '../../../controllers/MediaController.js';

const MediaCtrl = new MediaController();
const payloadMaxBytes = process.env.ROUTE_PAYLOAD_MAXBYTES || 10485760; // 10MB (1048576 (1 MB) is the default)
const videoPayloadMaxBytes = process.env.VIDEO_PAYLOAD_MAXBYTES || 1000000000; // 1 gb


export default (server) => {
    server.route([
        {
            method: 'GET',
            path: '/media',
            options: {
                description: 'Finds a media object by ID',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    query: Joi.object({
                        ...MediaCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return MediaCtrl.getByIdHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/media/image',
            options: {
                description: 'Adds a new image',
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
                        ...MediaCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return MediaCtrl.addImageHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/media/image',
            options: {
                description: 'Deletes an image',
                validate: {
                    payload: Joi.object({
                        ...MediaCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return MediaCtrl.deleteImageHandler(request, h);
                }
            }
        },

        // VIDEO
        {
            method: 'POST',
            path: '/media/video',
            options: {
                description: 'Adds a new video',
                payload: {
                    // output: 'stream',
                    output: 'file',
                    parse: true,
                    allow: 'multipart/form-data',
                    maxBytes: videoPayloadMaxBytes,
                    multipart: true
                },
                validate: {
                    payload: Joi.object({
                        ...MediaCtrl.service.getValidationSchemaForAdd()
                    })
                },
                handler: (request, h) => {
                    return MediaCtrl.addVideoHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/media/video',
            options: {
                description: 'Deletes a new video',
                validate: {
                    payload: Joi.object({
                        ...MediaCtrl.service.getIdValidationSchema()
                    })
                },
                handler: (request, h) => {
                    return MediaCtrl.deleteVideoHandler(request, h);
                }
            }
        }
    ]);
}
