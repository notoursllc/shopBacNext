import TenantController from '../../../controllers/TenantController.js';
import TenantMemberController from '../../../controllers/TenantMemberController.js';

const TenantCtrl = new TenantController();
const TenantMemberCtrl = new TenantMemberController();


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
                    strategies: ['storeauth', 'session']
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
                    strategies: ['session']
                },
                handler: (request, h) => {
                    return TenantMemberCtrl.logoutHandler(request, h);
                }
            }
        },


    ]);
}
