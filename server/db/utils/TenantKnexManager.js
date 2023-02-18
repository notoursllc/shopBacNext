import Knex from 'knex';
import config from '../../../knexfile.js';
const MAX_CONNECTION_CACHE = 10;


export default class TenantKnexManager {
    constructor () {
        this.knexCache = new Map();
    }

    /*
    * Creates a knex connection if one does not already
    * exist in the cache for the tenant
    */
    getKnexForTenant(tenantId) {
        if (!tenantId) {
            return null;
        }

        let _knex = this.knexCache.get(tenantId);

        if (!_knex) {
            _knex = Knex(this.knexConfigForTenant(tenantId));
            this.knexCache.set(tenantId, _knex);
        }

        // since functions are objects we can attach the tenant_id to the knex fn
        _knex.tenant_id = tenantId;

        // If the cache is too big then remove the first item
		if (this.knexCache.size > MAX_CONNECTION_CACHE) {
            const firstCached = this.knexCache.entries().next();

            // destroy the knex connection
			firstCached.value[1].destroy();

            // remove from cache
            this.knexCache.delete(first.value[0])
		}

        return _knex;
    }


    getKnexForRequest(request) {
        return this.getKnexForTenant(request.auth?.credentials?.id);
    }

    /*
    * Sets the value of the 'app.current_tenant` database property.
    * The value is the given tenantId.
    * If the tenantId is the superuser (process.env.TENANT_ID_BYPASSRLS)
    * then the connection user/password is changed to the DB user that is the superuser
    *
    * @returns {} knex config
    */
    knexConfigForTenant(tenantId) {
        const knexConfig = {
            ...config,
            pool: {
                min: 0,
				max: 4,
                afterCreate: (conn, done) => {
                    conn.query(`SET app.current_tenant = "${tenantId}"`, function(err) {
                        if(err) {
                            console.error(err)
                        }
                        done(err, conn);
                    });
                }
            }
        };

        // If the given tenantId is the one that should be able to bypass RLS policies, then we switch to the user defined by `DB_APPUSER_BYPASSRLS`,
        // otherwise we use the regular `DB_APPUSER` user, which does not have `BYPASSRLS` (see server/db/migrations/1_create_app_user.js)
        knexConfig.connection.user = tenantId === process.env.TENANT_ID_BYPASSRLS ? process.env.DB_APPUSER_BYPASSRLS : process.env.DB_APPUSER;
        knexConfig.connection.password = tenantId === process.env.TENANT_ID_BYPASSRLS ? process.env.DB_APPUSER_BYPASSRLS_PASSWORD : process.env.DB_APPUSER_PASSWORD;

        return knexConfig;
    }
}
