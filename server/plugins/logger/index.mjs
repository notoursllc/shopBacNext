import winston from 'winston';
// import bugsnag from '@bugsnag/node';
import Bugsnag from '@bugsnag/js'
import isObject from 'lodash.isobject';

export default {
    plugin: {
        once: true,
        pkg: {
            "name": "logger",
            "version": "0.0.1",
            "engines": {
                "node": ">=16.15.0"
            },
            "peerDependencies": {
                "@hapi/hapi": ">=18.0"
            }
        },
        register: function (server, options) {
            // Bugsnag setup:
            if(process.env.NODE_ENV !== 'test') {
                const bugsnagClient = Bugsnag.start({
                    apiKey: process.env.BUG_SNAG_API_KEY,
                    releaseStage: 'production'
                });

                global.bugsnag = () => {
                    const args = arguments;
                    if(process.env.NODE_ENV === 'production') {
                        bugsnagClient.notify(args);
                    }
                };
            }
            else {
                global.bugsnag = function(err) {
                    console.error(err);
                }
            }

            const prettyJson = winston.format.printf((info) => {
                info.metaData = isObject(info.meta) ? `- ${JSON.stringify({...info.meta})}` : info.meta;
                return `${info.timestamp} [${info.level}]: ${info.message} ${info.metaData}`;
            });

            global.logger = winston.createLogger({
                format: winston.format.combine(
                    winston.format.errors({ stack: true }),
                    winston.format.colorize(),
                    winston.format.timestamp(),
                    // This doesn't acutally format the results in LogDNA, except that it does cause
                    // the 'meta' object to be stringified in the LogDNA UI, which is all I really want.
                    // A 'prettiefied' meta object in LogDNA is kind of annoying read, I think.
                    prettyJson
                ),
                transports: [
                    new winston.transports.Console({
                        level: process.env.LOG_LEVEL || 'info'
                    })
                ]
            });

        }
    }
}
