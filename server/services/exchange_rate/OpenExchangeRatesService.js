import axios from 'axios';


function getAxios() {
    return axios.create({
        baseURL: 'https://openexchangerates.org/api/',
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: 10000, // wait for 10s
        validateStatus() {
            return true;
        }
    });
}


/**
 * https://docs.openexchangerates.org/docs/latest-json
 * @returns
 */
export async function getLatestOpenExchangeRates() {
    global.logger.info('REQUEST: OpenExchangeRatesService.getLatestOpenExchangeRates', {
        meta: {}
    });

    const $axios = await getAxios();
    const response = await $axios.get('latest.json', {
        params: {
            app_id: process.env.OPEN_EXCHANGE_RATES_APP_ID,
            base: 'USD'
        }
    });

    global.logger.info('RESPONSE: OpenExchangeRatesService.getLatestOpenExchangeRates', {
        meta: response?.data
    });

    return response?.data;
}
