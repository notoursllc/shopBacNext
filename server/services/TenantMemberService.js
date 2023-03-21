import bcrypt from 'bcryptjs';
import TenantMemberModel from '../models/TenantMemberModel.js';
import BaseService from './BaseService.js';

export default class TenantMemberService extends BaseService {

    constructor() {
        super(new TenantMemberModel());
    }


    setCookieOnRequest(request, tenantId) {
        // This is the httpOnly cookie that is used by the server that is required for access.
        // cookieAuth is a decoration added by the Hapi "cookie" module to set a session cookie:
        // https://hapi.dev/module/cookie/api/?v=11.0.1
        // The cookie content (the object sent to cookieAuth.set) will be encrypted.
        request.cookieAuth.set({
            id: tenantId
        });
    }


    async login(knex, email, password) {
        const TenantMember = await this.fetchOne({
            knex: knex,
            where: { email: email, active: true },
            columns: this.model.getAllColumns(true)
        });

        if(!TenantMember || !bcrypt.compareSync(password, TenantMember.password)) {
            throw new Error('Unauthorized')
        }

        return TenantMember;
    }

}
