import Joi from 'joi';
import Boom from '@hapi/boom';
import isObject from 'lodash.isobject';
import TKM from '../../db/utils/TenantKnexManager.js';
// import pkg from './package.json' assert { type: "json" };  // https://stackoverflow.com/a/70106896/2924415
import TenantService from '../../services/TenantService.js';
import TenantMemberService from '../../services/TenantMemberService.js';

// routes
import core from './routes/core.mjs';
import product from './routes/product.mjs';
import tenant from './routes/tenant.mjs';

const isProd = process.env.NODE_ENV === 'production';


export default {
    plugin: {
        once: true,
        pkg: {
            "name": "api",
            "version": "0.0.1",
            "type": "module",
            "engines": {
              "node": ">=16.15.0"
            },
            "peerDependencies": {
              "@hapi/hapi": ">=18.0"
            }
        },
        register: function (server, options) {

            const TenantKnexManager = new TKM();
            const TenantSvc = new TenantService();
            const TenantMemberSvc = new TenantMemberService();

            server.decorate('toolkit', 'apiSuccess', function (responseData, paginationObj) {
                const response = {};
                response.data = responseData;

                if(isObject(paginationObj)) {
                    response.pagination = paginationObj;
                }

                return this.response(response);
            });


            // Updates the response output with a 'data' property if a data
            // property also exists in the Boom error
            server.ext('onPreResponse', (request, h) => {
                const response = request.response;

                if (!response.isBoom || !response.hasOwnProperty('output')) {
                    return h.continue;
                }

                const is4xx = response.output.statusCode >= 400 && response.output.statusCode < 500;

                if (is4xx && response.data) {
                    response.output.payload.data = response.data;
                }

                return h.continue;
            });


            /*
            * Hapi lifecycle hook 'onPostAuth' is called after the auth.strategy.
            */
            server.ext('onPostAuth', (request, h) => {
                try {
                    const knex = TenantKnexManager.getKnexForRequest(request);

                    if (!knex) {
                        throw new Error('Error getting database connection for tenant');
                    }

                    request.knex = knex;
                }
                catch(err) {
                    console.error(err);
                    throw Boom.badRequest(err);
                }

                return h.continue;
            });


            // Basic auth for store API usage
            server.auth.strategy('storeauth', 'basic', {
                validate: async (request, tenant_id, api_key) => {
                    try {
                        const tenantData = await TenantSvc.apiKeyIsValid(tenant_id, api_key);

                        return {
                            isValid: tenantData ? true : false,
                            credentials: {
                                // tenant_id: tenantData.id
                                id: tenantData.id
                            }
                        }
                    }
                    catch(err) {
                        console.error(err);
                    }
                }
            });


            // Session auth
            // CORS cookie notes:
            // * To set a cookie via CORS ajax requests, SameSite=None is required
            // * SameSite=None requires Secure to be true
            server.auth.strategy('session', 'cookie', {
                // https://hapi.dev/module/cookie/api/?v=11.0.1
                cookie: {
                    name: 'bvsession',
                    password: process.env.SESSION_COOKIE_PASSWORD,
                    isSecure: isProd,
                    isHttpOnly: true,
                    isSameSite: isProd ? 'None' : false, // not for dev becaue 'None' also requires isSecure=true
                    domain: process.env.SESSION_COOKIE_DOMAIN,
                    path: '/',
                    // ttl: 3600000, // one hour
                    // ttl: 60000, // one minute
                    // ttl: process.env.SESSION_TTL,
                    clearInvalid: true
                },
                // keepAlive: true,
                validate: async (request, session) => {
                    const knex = TenantKnexManager.getKnexForTenant(process.env.TENANT_ID_BYPASSRLS);
                    const tenantMember = await TenantMemberSvc.fetchById(knex, session.id);

                    global.logger.info('Cookie validate', {
                        meta: {
                            tenantMember: tenantMember,
                            session_id: session.id
                        }
                    });

                    if(!tenantMember) {
                        global.logger.error('Cookie invalid because tenantMember does not exist', {
                            meta: {
                                session_id: session.id
                            }
                        });

                        return {
                            isValid: false
                        };
                    }

                    return {
                        isValid: true,
                        credentials: tenantMember
                    };
                }
            });


            server.auth.strategy('cronauth', 'basic', {
                validate: async (request, cronUser, cronPass) => {
                    const isValid = (cronUser === process.env.CRON_USERNAME && cronPass === process.env.CRON_PASSWORD);

                    return {
                        isValid: isValid,
                        credentials: isValid ? { user: cronUser } : null
                    };
                }
            });


            server.auth.default('session');


            server.dependency(
                [],
                function (server) {
                    core(server);
                    product(server);
                    tenant(server);
                }
            );
        }
    }
}
