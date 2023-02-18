import bcrypt from 'bcryptjs';
import TenantDao from '../db/dao/TenantDao.js';
import TenantKnexManager from '../db/utils/TenantKnexManager.js';
import ExchangeRateService from './exchange_rate/ExchangeRateService.js';
import BaseService from './BaseService.js';
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

}
