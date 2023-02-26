import BaseController from './BaseController.js';
import MasterTypeService from '../services/MasterTypeService.js';

export default class MasterTypeController extends BaseController {

    constructor() {
        super(new MasterTypeService());
    }

}
