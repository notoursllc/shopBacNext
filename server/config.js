import Confidence from 'confidence';

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}


const config = {
    $meta: 'This file configures the app.',
    port: {
        // web: {
        //     $filter: 'env',
        //     test: 80,
        //     production: process.env.PORT || 8000,
        //     $default: process.env.PORT || 8000
        // },
        server: {
            $filter: 'env',
            production: normalizePort(process.env.SERVER_PORT || 4000),
            $default: normalizePort(process.env.SERVER_PORT || 4000)
        }
    },
    db: {
        $filter: 'env',
        production: {
            debug: false
        },
        test: {
            debug: true
        },
        $default: {
            debug: true
        }
    }
};


const store = new Confidence.Store(config);

const criteria = {
    env: process.env.NODE_ENV
};

export default {
    get(key) {
        return store.get(key, criteria);
    },

    meta(key) {
        return store.meta(key, criteria);
    }
}
