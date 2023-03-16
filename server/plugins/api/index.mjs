// import pkg from './package.json' assert { type: "json" };  // https://stackoverflow.com/a/70106896/2924415

// server extensions, decorations, auth strategies
import serverExtensions from './serverExtensions.js';

// routes
import coreRoutes from './routes/core.mjs';
import exchangeRateRoutes from './routes/exchange_rates.mjs';
import heroRoutes from './routes/heros.mjs';
import masterTypeRoutes from './routes/master_types.mjs';
import mediaRoutes from './routes/media.mjs';
import packageTypeRoutes from './routes/package_types.mjs';
import productRoutes from './routes/products.mjs';
import productAccentMessageRoutes from './routes/product_accent_messages.mjs';
import productArtistRoutes from './routes/product_artists.mjs';
import productCollectionRoutes from './routes/product_collections.mjs';
import productColorSwatchRoutes from './routes/product_color_swatches.mjs';
import productDataTableRoutes from './routes/product_data_tables.mjs';
import productVariantRoutes from './routes/product_variants.mjs';
import productVariantSkuRoutes from './routes/product_variant_skus.mjs';
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
                    heroRoutes(server);
                    masterTypeRoutes(server);
                    mediaRoutes(server);
                    packageTypeRoutes(server);
                    productRoutes(server);
                    productAccentMessageRoutes(server);
                    productArtistRoutes(server);
                    productCollectionRoutes(server);
                    productColorSwatchRoutes(server);
                    productDataTableRoutes(server);
                    productVariantRoutes(server);
                    productVariantSkuRoutes(server);
                    tenantRoutes(server);
                }
            );
        }
    }
}
