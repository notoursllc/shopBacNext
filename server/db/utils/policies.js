export function getSql_enableRlsPolicyOnTable(tableName) {
    return `
        ALTER TABLE ${tableName}
        ENABLE ROW LEVEL SECURITY
    `;
};

export function getSql_createPolicyEnableSelectBasedOnTenantId(tableName) {
    return `
        CREATE POLICY "Enable select based on tenant_id"
        ON ${tableName}
        AS PERMISSIVE FOR SELECT
        USING (tenant_id = current_setting('app.current_tenant')::uuid)
    `;
};

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
