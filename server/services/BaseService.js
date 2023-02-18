export default class BaseService {

    constructor(dao) {
        this.dao = dao;
    }


    getTenantIdFromAuth(request) {
        return request.auth?.credentials?.tenant_id;
    }


    fetchOne(knex, params, includeHiddenCols) {
        return this.dao.fetchOne(knex, params, includeHiddenCols)
    }


    fetchById(knex, id, includeHiddenCols) {
        return this.fetchOne(knex, { id }, includeHiddenCols)
    }


    tenantCreate(knex, data) {
        return this.dao.tenantCreate(knex, data);
    }


    tenantUpdate(knex, id, data) {
        return this.dao.tenantUpdate(knex, id, data);
    }

}
