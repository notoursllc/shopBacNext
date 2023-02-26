// https://docs.bunny.net/reference/storage-api
// https://docs.bunny.net/reference/bunnynet-api-overview
import axios from 'axios';
import fs from 'fs-extra';
import isObject from 'lodash.isobject';
const streamLibraryId = process.env.BUNNY_API_STREAM_LIBRARY_ID;


/**
 * Add a leading slash (if needed) and remove the last slash (if needed) on a path
 * @param {String} path path
 */
 function fixSlashes(path) {
    if(path) {
        // add leading slash
        if(path[0] !== '/') {
            path = `/${path}`;
        }

        // remove trailing slash
        if (path[path.length - 1] === '/') {
            path = path.slice(0, -1);
        }
    }

    return path;
}


const api = {
    storage: {
        getAxios: (headerObj) => {
            return axios.create({
                baseURL: `${process.env.BUNNY_API_BASE_URL}/${process.env.BUNNY_API_STORAGE_ZONE}`,
                headers: Object.assign(
                    {},
                    (isObject(headerObj) ? headerObj : {}),
                    { 'AccessKey': process.env.BUNNY_API_STORAGE_KEY },
                ),
                timeout: 20000, // wait for 20s
                validateStatus() {
                    return true;
                }
            });
        },

        imageUpload: (fileName, file) => {
            const isProd = process.env.NODE_ENV === 'production';

            return api.storage.upload(
                `${isProd ? 'prod' : 'dev'}/images`,
                fileName,
                file
            );
        },

        tenantLogoUpload: (fileName, file) => {
            const isProd = process.env.NODE_ENV === 'production';

            return api.storage.upload(
                `${isProd ? 'prod' : 'dev'}/images/logos`,
                fileName,
                file
            );
        },

        /*
        * Upload a file
        * https://docs.bunny.net/reference/put_-storagezonename-path-filename
        */
        upload: async (path, fileName, file) => {
            global.logger.info(`REQUEST: BunnyAPI.storage.upload`, {
                meta: { path, fileName }
            });

            try {
                const instance = api.storage.getAxios({
                    'Content-Type': 'application/octet-stream'
                });

                const filePath = `${fixSlashes(path)}/${fileName}`;

                const res = await instance.put(
                    filePath,
                    fs.createReadStream(file.path)
                );

                if(parseInt(res.data.HttpCode, 10) !== 201) {
                    throw new Error(res.data.Message || 'An error occured when uploading the file');
                }

                const url = new URL(filePath, process.env.BUNNY_PULLZONE_URL);

                global.logger.info('RESPONSE: BunnyAPI.storage.upload', {
                    meta: { url: url.href }
                });

                return url.href;
            }
            catch (error) {
                throw new Error(error)
            }
        },

        /*
        * Delete a file
        * https://docs.bunny.net/reference/delete_-storagezonename-path-filename
        */
        del: async (url) => {
            global.logger.info(`REQUEST: BunnyAPI.storage.del`, {
                meta: { url }
            });

            try {
                const a = api.storage.getAxios();
                a.defaults.baseURL += url;

                await a.delete();

                global.logger.info('RESPONSE: BunnyAPI.storage.del', {
                    meta: { url }
                });

                return url;
            }
            catch (error) {
                throw new Error(error)
            }
        }
    },

    video: {
        getAxios: (headerObj) => {
            return axios.create({
                baseURL: `https://video.bunnycdn.com/library/${streamLibraryId}/videos`,
                headers: Object.assign(
                    {},
                    (isObject(headerObj) ? headerObj : {}),
                    {
                        'accept': 'application/json',
                        'content-type': 'application/*+json',
                        'AccessKey': process.env.BUNNY_API_STREAM_API_KEY
                    },
                ),
                timeout: 20000, // wait for 20s
                validateStatus() {
                    return true;
                }
            });
        },

        create: async (title) => {
            try {
                const res = await api.video.getAxios().post('/', {
                    title: title || `bv_video_${ new Date().getTime() }`,
                    collectionId: process.env.BUNNY_API_STREAM_LIBRARY_COLLECTION_ID
                });

                return res.data;
            }
            catch (error) {
                global.logger?.error('BunnyAPI.video.create', error);
                throw new Error(error)
            }
        },

        del: async (id) => {
            try {
                global.logger.info(`REQUEST: BunnyAPI.video.del`, {
                    meta: { id }
                });

                const a = api.video.getAxios();
                a.defaults.baseURL += `/${id}`;

                const res = await a.delete();

                global.logger.info('RESPONSE: BunnyAPI.video.del', {
                    meta: { ...res.data }
                });

                return res.data;
            }
            catch (error) {
                global.logger?.error('BunnyAPI.video.del', error);
                throw new Error(error)
            }
        },

        get: async (id) => {
            try {
                const res = await api.video.getAxios().get(`/${id}`);
                return res.data;
            }
            catch (error) {
                global.logger?.error('BunnyAPI.video.get', error);
                throw new Error(error)
            }
        },

        list: async (params) => {
            try {
                const res = await api.video.getAxios().get('/', {
                    params: {
                        page: 1,
                        itemsPerPage: 100,
                        orderBy: 'date',
                        ...params,
                        collection: process.env.BUNNY_API_STREAM_LIBRARY_COLLECTION_ID
                    }
                });
                return res.data;
            }
            catch (error) {
                global.logger?.error('BunnyAPI.video.list', error);
                throw new Error(error)
            }
        },

        upload: async (path, title) => {
            try {
                const createResponse = await api.video.create(title);

                if(!createResponse.guid) {
                    throw new Error('An error occurred when creating the video');
                    global.logger?.error('BunnyAPI.video.upload - Error creating video', createResponse);
                }

                const res = await api.video.getAxios({'content-type': 'application/octet-stream'})
                    .put(
                        `/${createResponse.guid}`,
                        fs.createReadStream(path)
                        // fs.createReadStream(File.path)
                    );

                if(res.data.success) {
                    return {
                        ...res.data,
                        id: createResponse.guid,
                        directPlayUrl: `https://video.bunnycdn.com/play/${streamLibraryId}/${createResponse.guid}`
                    }
                }

                return res.data;
            }
            catch (error) {
                global.logger?.error('BunnyAPI.video.upload', error);
                throw new Error(error)
            }
        }
    }
};

export default api;
