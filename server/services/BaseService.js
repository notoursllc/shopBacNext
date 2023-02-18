export default class BaseService {

    constructor(dao) {
        this.dao = dao;
    }


    getTenantIdFromAuth(request) {
        return request.auth?.credentials?.id;
    }


    fetchOne(knex, params, includeHiddenCols) {
        return this.dao.fetchOne(knex, params, includeHiddenCols)
    }


    fetchById(knex, id) {
        return this.fetchOne(knex, { id })
    }


    tenantCreate(knex, data) {
        return this.dao.tenantCreate(knex, data)
    }

}
