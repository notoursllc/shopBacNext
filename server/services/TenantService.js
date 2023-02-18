import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import isObject from 'lodash.isobject';
import TenantDao from '../db/dao/TenantDao.js';
import TenantKnexManager from '../db/utils/TenantKnexManager.js';
import ExchangeRateService from './exchange_rate/ExchangeRateService.js';
import BaseService from './BaseService.js';
import BunnyAPI from '../services/BunnyAPI.js';
import { sendEmail, compileMjmlTemplate } from './email/EmailService.js';

export default class TenantService extends BaseService {

    constructor() {
        super(new TenantDao());
        this.ExchangeRateService = new ExchangeRateService();
        this.TenantKnexManager = new TenantKnexManager();
    }


    /**
     * For each of the 'supported_currencies' set in the tenants table,
     * get the respective exchange rate
     *
     * @returns {*}
     */
    async getSupportedCurrenyRates(knex) {
        const result = await Promise.all([
            this.ExchangeRateService.fetchRate(knex),
            this.fetchById(knex, knex.tenant_id)
        ]);

        const ExchangeRate = result[0];
        const Tenant = result[1];
        const filteredRates = {
            base: null,
            default: null,
            rates: {}
        }

        if(ExchangeRate && Tenant) {
            filteredRates.base = ExchangeRate.base;

            if(Array.isArray(Tenant.supported_currencies)) {
                Tenant.supported_currencies.forEach((countryCode) => {
                    filteredRates.rates[countryCode] = ExchangeRate.rates[countryCode]
                });
            }
            else {
                filteredRates.rates = ExchangeRate.rates;
            }

            filteredRates.default = Tenant.default_currency;
        }

        return filteredRates;
    }


    async update(knex, id, data) {
        const Tenant = await this.fetchById(knex, id);

        if(!Tenant) {
            throw new Error('Tenant can not be found');
        }

        if(isObject(data.application_logo)) {
            data.application_logo = await BunnyAPI.storage.tenantLogoUpload(
                `${Date.now()}-${data.application_logo.filename}`,
                data.application_logo
            );

            // delete the previous image
            // No need for 'await' here right?
            if(Tenant.application_logo) {
                BunnyAPI.storage.del(Tenant.application_logo);
            }
        }

        if(Array.isArray(data.shipengine_carriers)) {
            for(let i=data.shipengine_carriers.length-1; i>=0; i--) {
                if(!data.shipengine_carriers[i].id
                    || !data.shipengine_carriers[i].service_codes?.domestic
                    || !data.shipengine_carriers[i].service_codes?.international) {
                    data.shipengine_carriers.splice(i, 1);
                }
            }
        }

        return this.tenantUpdate(knex, id, data)
    }


    async updateApiKey(knex, id) {
        const tokens = this.generateToken();

        return this.tenantUpdate(knex, id, {
            api_key: tokens.hashedToken,
            api_key_public: tokens.token
        });
    }


    async removeApiKey(knex, id) {
        return this.tenantUpdate(knex, id, {
            api_key: null,
            api_key_public: null
        });
    }


    /**
     * Get "Account" data, which is my made up label meaning a limited view
     * of Tenant data.
     *
     * @param {*} knex
     * @param {*} id
     */
    async fetchAccount(knex, id) {
        const Tenant = await this.fetchById(knex, id);

        if(!Tenant) {
            return;
        }

        const whitelist = Object.keys(this.getAccountSchema());
        const account = {};

        for(let key in Tenant) {
            if(whitelist.includes(key)) {
                account[key] = Tenant[key];
            }
        }

        return account;
    }


    sendContactUsEmailToAdmin(data) {
        global.logger.info('REQUEST: TenantService:sendContactUsEmailToAdmin', {
            meta: data
        });

        const response = sendEmail({
            to: 'gregbruins@gmail.com',
            // to: process.env.EMAIL_ADMIN,
            subject: `CONTACT US form submission (${data.application_name})`,
            html: compileMjmlTemplate('contact-us.mjml', {
                application_name: data.application_name,
                name: data.name,
                company: data.company,
                email: data.email,
                message: data.message
            })
        });

        global.logger.info('RESPONSE: TenantService:sendContactUsEmailToAdmin', {
            meta: response
        });

        return response;
    }


    async apiKeyIsValid(tenant_id, api_key) {
        try {
            if (!tenant_id || !api_key) {
                global.logger.error('TenantService:apiKeyIsValid - FAILED');
                return false;
            }

            const _knex = this.TenantKnexManager.getKnexForTenant(process.env.TENANT_ID_BYPASSRLS);
            const tenantData = await this.fetchOne(_knex, {
                id: tenant_id,
                active: true
            });

            if(!tenantData) {
                global.logger.error('TenantService:apiKeyIsValid - FAILED - no Tenant found');
                return false;
            }

            if(!tenantData.api_key) {
                global.logger.error('TenantService:apiKeyIsValid - FAILED - Tenant does not have an API key');
                return false;
            }

            const isValid = bcrypt.compareSync(api_key, tenantData.api_key);

            if(!isValid) {
                global.logger.error('TenantService:apiKeyIsValid - FAILED - api key does not match hash');
                return false;
            }

            global.logger.info('RESPONSE: TenantService:apiKeyIsValid', {
                meta: {
                    tenant: tenantData.id
                }
            });

            return tenantData;
        }
        catch(err) {
            console.log(err);
        }
    }


    generateToken() {
        const token = uuidv4().replace(/-/g, '');
        const salt = bcrypt.genSaltSync(10);
        const hashedToken = bcrypt.hashSync(token, salt);

        return {
            token,
            hashedToken
        }
    }


    getAccountSchema() {
        const schemaCopy = { ...this.dao.schema };

        const blacklist = [
            'id',
            'api_key',
            'api_key_public',
            'active',
            'created_at',
            'updated_at'
        ];

        blacklist.forEach((key) => {
            delete schemaCopy[key];
        });

        return schemaCopy;
    }

}
