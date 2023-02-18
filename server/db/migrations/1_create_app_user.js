/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return Promise.all([
        // put our two 'app' users into a group so it's easier to grand privileges to them in subsequent migrations
        knex.raw(`
            GRANT ${process.env.DB_APP_ALL_USERS_GROUP_NAME} TO ${process.env.DB_APPUSER}, ${process.env.DB_APPUSER_BYPASSRLS}
        `),

        // grant all privs to the group, so both users get them
        knex.raw(`GRANT ALL PRIVILEGES ON DATABASE ${process.env.DB_NAME} to ${process.env.DB_APP_ALL_USERS_GROUP_NAME}`),

        // The DB user defined by `DB_APPUSER_BYPASSRLS` will be able to bypass RLS:
        knex.raw(`ALTER ROLE ${process.env.DB_APPUSER_BYPASSRLS} BYPASSRLS`),
    ]);
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {

};
