// import pkg from './package.json' assert { type: "json" };  // https://stackoverflow.com/a/70106896/2924415

// server extensions, decorations, auth strategies
import serverExtensions from './serverExtensions.js';

// routes
import coreRoutes from './routes/core.mjs';
import exchangeRateRoutes from './routes/exchange_rates.mjs';
import masterTypeRoutes from './routes/master_types.mjs';
import packageTypeRoutes from './routes/package_types.mjs';
import productRoutes from './routes/product.mjs';
import tenantRoutes from './routes/tenant.mjs';

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
            server.dependency(
                [],
                function (server) {
                    serverExtensions(server);
                    coreRoutes(server);
                    exchangeRateRoutes(server);
                    masterTypeRoutes(server);
                    packageTypeRoutes(server);
                    productRoutes(server);
                    tenantRoutes(server);
                }
            );
        }
    }
}
