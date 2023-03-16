import Joi from 'joi';
import TenantController from '../../../controllers/TenantController.js';
import TenantMemberController from '../../../controllers/TenantMemberController.js';
import TenantService from '../../../services/TenantService.js';

const TenantCtrl = new TenantController();
const TenantMemberCtrl = new TenantMemberController();
const TenantSvc = new TenantService();
const payloadMaxBytes = process.env.ROUTE_PAYLOAD_MAXBYTES || 10485760; // 10MB (1048576 (1 MB) is the default)


export default (server) => {
    server.route([
        {
            method: 'POST',
            path: '/tenant/contactus',
            options: {
                description: 'Contact us',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                validate: {
                    payload: TenantCtrl.contactUsHandlerRequestValidation()
                },
                handler: (request, h) => {
                    return TenantCtrl.contactUsHandler(request, h);
                }
            }
        },
        {
            method: 'GET',
            path: '/tenant/exchange-rates',
            options: {
                description: 'GET the tenants supported_currencies mapped to the respective exhange rates',
                auth: {
                    strategies: ['storeauth', 'session']
                },
                handler: (request, h) => {
                    return TenantCtrl.exchangeRatesHandler(request, h);
                }
            }
        },

        // NOTE: currently the RLS policy on tenant_members does not allow POST/PUT/DELETE
        // {
        //     method: 'POST',
        //     path: '/tenant/member',
        //     options: {
        //         description: 'Creates a new tenant member',
        //         // auth: false,
        //         auth: {
        //             strategies: ['storeauth', 'session']
        //         },
        //         validate: {
        //             payload: TenantMemberCtrl.createMemberRequestValidation()
        //         },
        //         handler: (request, h) => {
        //             return TenantMemberCtrl.createHandler(request, h);
        //         }
        //     }
        // },

        {
            method: 'POST',
            path: '/tenant/member/login',
            options: {
                description: 'Authenticates a tenant member and sets a cookie',
                // auth: false,
                auth: {
                    strategies: ['storeauth', 'session'],
                    // strategies: ['storeauth']
                    // strategies: ['storeauth'],
                    mode: 'optional'
                },
                validate: {
                    payload: TenantMemberCtrl.loginRequestValidation()
                },
                handler: (request, h) => {
                    return TenantMemberCtrl.loginHandler(request, h);
                }
            }
        },
        {
            method: 'POST',
            path: '/tenant/member/logout',
            options: {
                description: 'Logs out a tenant member',
                auth: {
                    // strategies: ['session']
                    strategies: ['storeauth', 'session']
                },
                handler: (request, h) => {
                    return TenantMemberCtrl.logoutHandler(request, h);
                }
            }
        },

        /*
        *  ACCOUNT
        */
        {
            method: 'GET',
            path: '/account',
            options: {
                description: 'GET abbreviated Tenant data',
                auth: {
                    strategies: ['session']
                },
                handler: (request, h) => {
                    return TenantCtrl.fetchAccountHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/account',
            options: {
                description: 'Updates limited Tenant data',
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
                        ...TenantSvc.getAccountSchema()
                    })
                },
                handler: (request, h) => {
                    return TenantCtrl.updateHandler(request, h);
                }
            }
        },
        {
            method: 'PUT',
            path: '/account/api_key',
            options: {
                description: 'Updates the API key for the Tenant',
                auth: {
                    strategies: ['session']
                },
                handler: (request, h) => {
                    return TenantCtrl.updateApiKeyHandler(request, h);
                }
            }
        },
        {
            method: 'DELETE',
            path: '/account/api_key',
            options: {
                description: 'Deletes the API key for the Tenant',
                auth: {
                    strategies: ['session']
                },
                handler: (request, h) => {
                    return TenantCtrl.deleteApiKeyHandler(request, h);
                }
            }
        }
    ]);
}
