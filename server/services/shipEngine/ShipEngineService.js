import isObject from 'lodash.isobject';
import TenantService from '../TenantService.js';
import CartService from '../cart/CartService.js';
import PackageService from '../PackageService.js';
import ShipEngineApi from './ShipEngineApi.js';


export default class ShipEngineService {

    constructor() {
        this.TenantService = new TenantService();
    }


    async getTenant(knex) {
        const Tenant = await this.TenantService.fetchAccount(knex, knex.userParams.tenant_id);

        if(!Tenant) {
            throw new Error('Unable to obtain Tenant');
        }

        return Tenant;
    }


    async getCarrierIdsForTenant(knex) {
        const Tenant = await this.getTenant(knex);
        return Tenant.shipengine_carriers?.map((obj) => obj.id);
    }


    /**
     * https://www.shipengine.com/international-shipping/
     *
     * @param {*} cart
     * @returns
     */
    getCustomsConfig(cart) {
        const config = {
            contents: 'merchandise',
            non_delivery: 'treat_as_abandoned',
            customs_items: []
        }

        if(Array.isArray(cart.cart_items)) {
            cart.cart_items.forEach((obj) => {
                config.customs_items.push({
                    quantity: obj.qty,
                    description: obj.product.description,
                    harmonized_tariff_code: obj.product.customs_harmonized_system_code,
                    country_of_manufacture: obj.product.customs_country_of_origin,
                    country_of_origin: obj.product.customs_country_of_origin,

                    value: {
                        currency: 'usd',
                        amount: obj.product_variant_sku.display_price
                    }
                });
            });
        }

        return config;
    }


    async getApiPackageTypes(knex, cart, packageTypes) {
        const package_types = [];
        const CartSvc = new CartService();

        // if any of the DB packageTypes have a specific value defined, then add it:
        packageTypes.forEach((type) => {
            if(type.code_for_carrier && !package_types.includes(type.code_for_carrier)) {
                package_types.push(type.code_for_carrier);
            }
        });

        // USPS has a more generic type called "package",
        // which seems like a good thing to add as a fallback.
        // (This may change though as I learn more about shipping)
        // NOTE: currently, I am only using USPS, so this will always be true.  Future proofing though
        // in case I use fedex someday
        const service_codes = await this.getServiceCodesForCart(knex, cart);
        if(
            (service_codes.includes('usps_priority_mail') || service_codes.includes('usps_priority_mail_international'))
            && !package_types.includes('package')
        ) {
            package_types.push('package');
        }

        return package_types;
    }


    async isDomesticShipment(knex, cart) {
        const Tenant = await this.getTenant(knex);
        const countryCode = cart?.shipping_countryCodeAlpha2;

        if(!countryCode || countryCode === Tenant.shipping_from_countryCodeAlpha2) {
            return true
        }

        return false;
    }


    async getServiceCodesForCart(knex, cart) {
        const Tenant = await this.getTenant(knex);
        const isDomestic = await this.isDomesticShipment(knex, cart);

        return Tenant.shipengine_carriers?.map((obj) => {
            return obj.service_codes[isDomestic ? 'domestic' : 'international']
        });

        // fedex comparible: fedex_standard_overnight / fedex_international_economy
    }


     /**
     * Builds the API request payload for ShipEngineCtrl.getRates()
     *
     * Separating out this method from getShippingRatesForCart
     * so it can be unit tested.  It's important that the API
     * request payload is correct.
     *
     * @param {*} cart
     */
     async getRatesApiPayload(knex, cart, packageTypes) {
        const CartSvc = new CartService();
        const Tenant = await this.getTenant(knex);
        const carrierIds = await this.getCarrierIdsForTenant(knex);
        const serviceCodes = await this.getServiceCodesForCart(knex, cart);
        const shipmentIsDomestic = await this.isDomesticShipment(knex, cart);
        // const apiPackageTypes = await this.getApiPackageTypes(knex, cart, packageTypes);

        try {
            const apiPayload = {
                rate_options: {
                    carrier_ids: carrierIds,
                    service_codes: serviceCodes,
                    // package_types: apiPackageTypes,
                    calculate_tax_amount: false,
                    preferred_currency: 'usd'
                },
                shipment: {
                    ship_from: {
                        company_name: Tenant.shipping_from_company,
                        name: Tenant.shipping_from_name,
                        phone: Tenant.shipping_from_phone,
                        address_line1: Tenant.shipping_from_streetAddress,
                        // address_line2: Tenant.shipping_from_extendedAddress,
                        city_locality: Tenant.shipping_from_city,
                        state_province: Tenant.shipping_from_state,
                        postal_code: Tenant.shipping_from_postalCode,
                        country_code: Tenant.shipping_from_countryCodeAlpha2,
                        // address_residential_indicator: "no"
                    },
                    ship_to: {
                        name: `${cart.shipping_firstName} ${cart.shipping_lastName}`,
                        phone: cart.shipping_phone,
                        address_line1: cart.shipping_streetAddress,
                        city_locality: cart.shipping_city,
                        state_province: cart.shipping_state,
                        postal_code: cart.shipping_postalCode,
                        country_code: cart.shipping_countryCodeAlpha2,
                        // address_residential_indicator: "yes"
                    },
                    packages: [] // this will be constructed below
                }
            };

            const packingResults = PackageService.packProducts(
                CartSvc.getProductArrayFromCart(cart),
                packageTypes
            );

            // console.log("PACKING RESULTS", packingResults)
            // console.log("PACKING PACKED", packingResults.packed);
            // console.log("PACKING PACKED[0] BOX", packingResults.packed[0].box);

            // Collecting the array of boxes (package_types) so I can determine
            // the apiPayload.rate_options.package_types value.  Sending specific
            // package_types in the API request will give the most accurate rates.
            //
            // NOTE that there is a scenario where packingResults.packed is an empty array.
            // This would occur if none of the packageTypes passed into getRatesApiPayload()
            // was a fit for the producs(s). If this were to occur then of course
            // apiPayload.shipment.packages would remain empty, and calling
            // ShipEngineCtrl.getRates(apiPayload) would not return any rates.
            const packedBoxes = packingResults.packed.map((obj) => {
                if(isObject(obj) && isObject(obj.box)) {
                    return obj.box;
                }
            });

            const apiPackageTypes = await this.getApiPackageTypes(knex, cart, packedBoxes);
            apiPayload.rate_options.package_types = apiPackageTypes;

            // build the 'apiPayload.shipment.packages' API argument
            packingResults.packed.forEach((obj) => {
                const apiPackage = {
                    weight: {
                        value: typeof obj.box.weight_oz === 'number' ? obj.box.weight_oz : 0, // the weight of the box itself
                        unit: 'ounce' // pound,ounce
                    },
                    dimensions: {
                        length: obj.box.length_cm,
                        width: obj.box.width_cm,
                        height: obj.box.height_cm,
                        unit: 'centimeter' // inch,centimeter: https://www.shipengine.com/docs/shipping/size-and-weight/#dimensions
                    }
                }

                // The initial value of apiPackage.weight.value is simply the
                // weight of the box itself (if specified).
                // Now we add to that value the combined weight of all products in the box:
                if(Array.isArray(obj.products)) {
                    obj.products.forEach((prod) => {
                        apiPackage.weight.value += CartSvc.getProductWeight(prod.id, cart);
                    });
                }

                apiPayload.shipment.packages.push(apiPackage);
            });

            if(!shipmentIsDomestic) {
                apiPayload.shipment.customs = this.getCustomsConfig(cart);
            }

            return {
                apiArgs: apiPayload,
                packingResults: packingResults
            }
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw err;
        }
    }


    async getShippingRatesForCart(knex, cart, packageTypes) {
        try {
            // API call to get ShipEngine rates
            const { apiArgs, packingResults } = await this.getRatesApiPayload(knex, cart, packageTypes);
            // console.log("getShippingRatesForCart: API ARGS", apiArgs)
            // console.log("getShippingRatesForCart: API ARGS PACKAGES", apiArgs.shipment.packages)

            // If the apiArgs.shipment.packages is an empty array
            // then no rates will be returned by ShipEngineCtrl.getRates()
            // understandably, since it has ship_from and ship_to but no
            // idea of what the packages are.
            // I don't think it's the responsibility of this method to
            // determine how to handle this scenario.
            if(!apiArgs.shipment.packages.length) {
                global.logger.warn('ShipEngineCtrl.getShippingRatesForCart - API PAYLOAD DOES NOT CONTAIN ANY PACKAGES', {
                    meta: {
                        apiArgs
                    }
                });
            }

            const { rate_response } = await ShipEngineApi.getRates(knex, apiArgs);
            const response = {};

            // apiArgs.shipment.packages.forEach((obj) => {
            //     console.log("package PACKAGE", obj)
            // })
            // console.log("RATE RESPONSE", rate_response);
            // console.log("RATES", rate_response.rates);
            // console.log("INVALID RATES", rate_response.invalid_rates);

            // I want to log invalid rates for prod
            if(rate_response?.invalid_rates?.length) {
                global.logger.warn('ShipEngineCtrl.getShippingRatesForCart - INVALID RATES', {
                    meta: {
                        invalid_rates: rate_response.invalid_rates
                    }
                });
            }

            // TODO: add logic that will not add to the rates obj
            // if the entry's shipping_amount is greater than the shipping_amount of a faster entry
            // - ignore rate if delivery_days/estimated_deleivery_date is null
            if(isObject(rate_response) && Array.isArray(rate_response.rates)) {
                rate_response.rates.forEach((obj) => {
                    if(!response.hasOwnProperty(obj.delivery_days)) {
                        response[obj.delivery_days] = obj;
                    }
                    else {
                        if(response[obj.delivery_days].shipping_amount.amount > obj.shipping_amount.amount) {
                            response[obj.delivery_days] = obj;
                        }
                    }
                });
            }

            // Return the rates and the packing results that those rates were based on.
            return {
                rates: Object.values(response),
                packingResults: packingResults
            }
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
            throw err;
        }
    }


}
