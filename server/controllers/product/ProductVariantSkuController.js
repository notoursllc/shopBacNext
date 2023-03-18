import Boom from '@hapi/boom';
import BaseController from '../BaseController.js';
import ProductVariantSkuService from '../../services/product/ProductVariantSkuService.js';

export default class ProductVariantSkuController extends BaseController {

    constructor() {
        super(new ProductVariantSkuService());
    }

}
