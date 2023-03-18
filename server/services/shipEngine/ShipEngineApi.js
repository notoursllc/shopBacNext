import axios from 'axios';
import TenantService from '../TenantService.js';

const TenantSvc = new TenantService();


async function getAxios(knex) {
    const Tenant = await TenantSvc.fetchAccount(knex, knex.userParams.tenant_id);

    if(!Tenant) {
        throw new Error('Unable to obtain Tenant');
    }

    if(!Tenant.shipengine_api_key) {
        throw new Error('Unable to obtain the ship engine API key from Tenant');
    }

    return axios.create({
        baseURL: 'https://api.shipengine.com/v1/',
        headers: {
            'api-key': Tenant.shipengine_api_key,
            'Content-Type': 'application/json'
        },
        timeout: 10000, // wait for 10s
        validateStatus() {
            return true;
        }
    });
}


async function axiosGet(knex, url, params) {
    const $axios = await getAxios(knex);
    return $axios.get(url, {
        params: params
    });
}


async function axiosPost(knex, url, payload) {
    const $axios = await getAxios(knex);
    return $axios.post(url, payload);
}


async function axiosDelete(knex, url) {
    const $axios = await getAxios(knex);
    return $axios.delete(url);
}


/**
 * https://www.shipengine.com/docs/rates/
 *
 * @param {*} payload
 * @returns
 */
async function getRates(knex, payload) {
    global.logger.info('REQUEST: ShipEngineApi.getRates', {
        meta: {
            payload
        }
    });

    const { data } = await axiosPost(knex, 'rates', payload);

    global.logger.info('RESPONSE: ShipEngineApi.getRates', {
        meta: { data }
    });

    if(data?.errors?.length) {
        global.logger.warn('RESPONSE: ShipEngineApi.getRates ERRORS', {
            meta: data.errors
        });
    }

    return data;
}


async function getRate(knex, id) {
    global.logger.info('REQUEST: ShipEngineApi.getRate', {
        meta: { id }
    });

    const { data } = await axiosGet(knex, `rates/${id}`);

    global.logger.info('RESPONSE: ShipEngineApi.getRate', {
        meta: data
    });

    return data;
}


async function buyShippingLabel(knex, rateId) {
    global.logger.info('REQUEST: ShipEngineApi.buyShippingLabel', {
        meta: { rateId }
    });

    const { data } = await axiosPost(knex, `labels/rates/${rateId}`);

    global.logger.info('RESPONSE: ShipEngineApi.buyShippingLabel', {
        meta: data
    });

    return data;
}


async function getShippingLabel(knex, labelId) {
    global.logger.info('REQUEST: ShipEngineApi.getShippingLabel', {
        meta: { labelId }
    });

    const { data } = await axiosGet(knex, `labels/${labelId}`);

    global.logger.info('RESPONSE: ShipEngineApi.getShippingLabel', {
        meta: data
    });

    return data;
}


/*
* https://www.shipengine.com/docs/reference/list-labels/
*/
async function listShippingLabels(knex, params) {
    global.logger.info('REQUEST: ShipEngineApi.listShippingLabels', {
        meta: { params }
    });

    const { data } = await axiosGet(knex, 'labels', params);

    global.logger.info('RESPONSE: ShipEngineApi.listShippingLabels', {
        meta: data
    });

    return data;
}


/*
* https://www.shipengine.com/docs/addresses/validation/
*/
async function validateAddresses(knex, payload) {
    global.logger.info('REQUEST: ShipEngineApi.validateAddresses', {
        meta: { payload }
    });

    const { data } = await axiosPost(knex, 'addresses/validate', payload);

    global.logger.info('RESPONSE: ShipEngineApi.validateAddresses', {
        meta: data
    });

    return data;
}


async function getCarriers(knex) {
    const { data } = await axiosGet(knex, 'carriers');
    return data;
}


/*
* https://www.shipengine.com/docs/reference/carriers/update-carrier/
*/
async function updateStampsComAccountOnCarrier(knex, carrierId, payload) {
    const { data } = await axiosPost(knex, `connections/carriers/stamps_com/${carrierId}`, payload);
    return data;
}


async function removeStampsComAccountFromCarrier(knex, carrierId) {
    const { data } = await axiosDelete(knex, `connections/carriers/stamps_com/${carrierId}`)
    return data;
}


/*
* https://www.shipengine.com/docs/tracking/#tracking-status-codes
*/
function getTrackingStatusCodes() {
    return {
        AC:	{ description: 'Accepted', tracking_status: 'N/A' },
        IT: { description: 'In Transit', tracking_status: 'in_transit' },
        DE:	{ description: 'Delivered', tracking_status: 'delivered' },
        EX:	{ description: 'Exception', tracking_status: 'error' },
        UN:	{ description: 'Unknown', tracking_status: 'unknown' },
        AT:	{ description: 'Delivery Attempt', tracking_status: 'N/A' },
        NY:	{ description: 'Not Yet In System', tracking_status: 'in_transit' }
    }
}


/*
* https://www.shipengine.com/docs/tracking/#supported-carriers
*/
function getTrackingUrl(carrierCode, trackingNumber) {
    const cc = carrierCode ? carrierCode.toLowerCase() : null;

    switch(cc) {
        case 'usps':
        case 'stamps_com':
            return `https://tools.usps.com/go/TrackConfirmAction_input?strOrigTrackNum=${trackingNumber} `;

        case 'ups':
            return `https://www.ups.com/track?tracknum=${trackingNumber}`;

        case 'fedex':
            return `https://www.fedex.com/fedextrack/?action=track&trackingnumber=${trackingNumber}`
    }
}


export default {
    getRates,
    getRate,
    buyShippingLabel,
    getShippingLabel,
    listShippingLabels,
    validateAddresses,
    getCarriers,
    updateStampsComAccountOnCarrier,
    removeStampsComAccountFromCarrier,
    getTrackingStatusCodes,
    getTrackingUrl
}
