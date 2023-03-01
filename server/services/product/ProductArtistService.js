
import BaseService from '../BaseService.js';
import ProductArtistDao from '../../db/dao/product/ProductArtistDao.js';

export default class ProductService extends BaseService {

    constructor() {
        super(new ProductArtistDao());
    }


    /**
     * Adds artist relation to a list of products
     *
     * @param {*} knex
     * @param {*} products
     * @returns []
     */
    async addRelationToProducts(knex, products) {
        await this.dao.addRelations(
            products,
            'product_artist_id',
            knex.select(this.dao.getAllColumns()).from(this.dao.tableName).whereNull('deleted_at'),
            'id',
            'artist',
            true
        );
    }

}
