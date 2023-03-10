import BaseController from '../BaseController.js';
import ProductCollectionService from '../../services/product/ProductCollectionService.js';

export default class ProductCollectionController extends BaseController {

    constructor() {
        super(new ProductCollectionService());
    }

}
