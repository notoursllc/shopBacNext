
import Joi from 'joi';
import BaseService from '../BaseService.js';
import ProductArtistModel from '../../models/product/ProductArtistModel.js';
import BunnyAPI from '../BunnyAPI.js';

export default class ProductService extends BaseService {

    constructor() {
        super(new ProductArtistModel());
    }


    uploadImage(file) {
        return BunnyAPI.storage.imageUpload(`${Date.now()}-${file.filename}`, file);
    }


    async upsertArtist(knex, data) {
        const payload = { ...data };

        if(payload.file) {
            payload.image = await this.uploadImage(payload.file);
        }

        delete payload.file;

        return this.upsertOne({
            knex: knex,
            data: payload
        });
    }


    /**
     * Adds artist relation to a list of products
     *
     * @param {*} knex
     * @param {*} products
     * @returns []
     */
    async addRelationToProducts(knex, products) {
        await this.setRelations(
            products,
            'product_artist_id',
            knex.select(this.model.getAllColumns()).from(this.model.tableName).whereNull('deleted_at'),
            'id',
            'artist',
            true
        );
    }


    getValidationSchemaForAdd() {
        const schemaCopy = super.getValidationSchemaForAdd();
        schemaCopy.file = Joi.object();

        return schemaCopy;
    }


    getValidationSchemaForUpdate() {
        const schemaCopy = super.getValidationSchemaForUpdate();
        schemaCopy.file = Joi.object();

        return schemaCopy;
    }


}
