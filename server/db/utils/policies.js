export function getSql_enableRlsPolicyOnTable(tableName) {
    return `
        ALTER TABLE ${tableName}
        ENABLE ROW LEVEL SECURITY
    `;
};

/*
* https://www.postgresql.org/docs/current/sql-createpolicy.html
*/
export function getSql_createPolicyEnableAllBasedOnTenantId(tableName) {
    return `
        CREATE POLICY "Enable all based on tenant_id"
        ON ${tableName}
        AS PERMISSIVE
        FOR ALL
        USING (tenant_id = current_setting('app.current_tenant')::uuid)
    `;
};

export function getSql_createPolicyEnableSelectBasedOnId(tableName) {
    return `
        CREATE POLICY "Enable select based on id"
        ON ${tableName}
        AS PERMISSIVE
        FOR SELECT
        USING (id = current_setting('app.current_tenant')::uuid)
    `;
}

export function getSql_createPolicyEnableUpdateBasedOnId(tableName) {
    return `
        CREATE POLICY "Enable UPDATE based on id"
        ON ${tableName}
        AS PERMISSIVE
        FOR UPDATE
        USING (id = current_setting('app.current_tenant')::uuid)
    `;
}

export function getSql_grantSelect(tableName) {
    return `
        GRANT SELECT
        ON ${tableName}
        TO ${process.env.DB_APP_ALL_USERS_GROUP_NAME}
    `;
};

export function getSql_grantSelectUpdate(tableName) {
    return `
        GRANT SELECT, UPDATE
        ON ${tableName}
        TO ${process.env.DB_APP_ALL_USERS_GROUP_NAME}
    `;
};

export function getSql_grantSelectInsertUpdate(tableName) {
    return `
        GRANT SELECT, INSERT, UPDATE
        ON ${tableName}
        TO ${process.env.DB_APP_ALL_USERS_GROUP_NAME}
    `;
};

export function getSql_grantSelectInsertUpdateDelete(tableName) {
    return `
        GRANT SELECT, INSERT, UPDATE, DELETE
        ON ${tableName}
        TO ${process.env.DB_APP_ALL_USERS_GROUP_NAME}
    `;
}
