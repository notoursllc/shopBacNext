import BaseController from '../BaseController.js';
import ProductAccentMessageService from '../../services/product/ProductAccentMessageService.js';

export default class ProductAccentMessageController extends BaseController {

    constructor() {
        super(new ProductAccentMessageService());
    }

}
