import MasterTypeModel from '../models/MasterTypeModel.js';
import BaseService from './BaseService.js';

export default class MasterTypeService extends BaseService {

    constructor() {
        super(new MasterTypeModel());
    }


    async addMasterType(knex, data) {
        const allMasterTypes = await super.search({
            knex: knex,
            where: { object: data.object }
        });

        data.value = this.getNextAvailableTypeValue(allMasterTypes);

        return super.upsertOne({
            knex: knex,
            data: data
        });
    }


    getNextAvailableTypeValue(allTypes) {
        let highestValue = 0;

        // find the highest value
        allTypes.forEach((obj) => {
            if(obj.value > highestValue) {
                highestValue = obj.value;
            }
        });

        let factor = 0;

        if(highestValue) {
            factor = parseInt(Math.log(highestValue) / Math.log(2), 10); // current factor
            factor++; // what the new factor should be
        }

        return Math.pow(2, factor);
    }



    formatForUpsert(data) {
        if (data.metadata) {
            data.metadata = JSON.stringify(data.metadata)
        }

        return data;
    }


    getValidationSchemaForAdd() {
        const schema = { ...super.getValidationSchemaForAdd() };
        schema.name = schema.name.required();
        schema.object = schema.object.required();

        return schema;
    }

}
