import CoreController from '../../controllers/CoreController.js';

const CoreCtrl = new CoreController();

export default {
    plugin: {
        once: true,
        pkg: {
            'name': 'files',
            'version': '0.0.1',
            'engines': {
                'node': '>=16.15.0'
            },
            'peerDependencies': {
                '@hapi/hapi': '>=18.0'
            }
        },
        register: function (server, options) {
            server.route([
                {
                    method: 'GET',
                    path: '/robots.txt', // NOTE: no routePrefix on this one
                    options: {
                        auth: false,
                        description: 'For generating robots.txt',
                    },
                    handler: (request, h) => {
                        return CoreCtrl.robotsHandler(request, h);
                    }
                },
                {
                    method: 'GET',
                    path: '/sitemap.xml',
                    options: {
                        auth: false,
                        description: 'For generating sitemap.xml',
                    },
                    handler: (request, h) => {
                        return CoreCtrl.sitemapHandler(request, h);
                    }
                }
            ]);
        }
    }
};
