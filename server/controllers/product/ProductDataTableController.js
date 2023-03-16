import BaseController from '../BaseController.js';
import ProductDataTableService from '../../services/product/ProductDataTableService.js';

export default class ProductDataTableController extends BaseController {

    constructor() {
        super(new ProductDataTableService());
    }

}
