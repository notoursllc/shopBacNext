import BaseController from '../BaseController.js';
import ProductColorSwatchService from '../../services/product/ProductColorSwatchService.js';

export default class ProductColorSwatchController extends BaseController {

    constructor() {
        super(new ProductColorSwatchService());
    }

}
