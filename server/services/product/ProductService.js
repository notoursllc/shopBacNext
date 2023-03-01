
import BaseService from '../BaseService.js';
import ProductDao from '../../db/dao/product/ProductDao.js';
import ProductArtistService from './ProductArtistService.js';
import ProductVariantService from './ProductVariantService.js';
import { makeArray } from '../../utils/index.js';


export default class ProductService extends BaseService {

    constructor() {
        super(new ProductDao());
        this.ProductArtistService = new ProductArtistService();
        this.ProductVariantService = new ProductVariantService();
    }


    async getProducts(knex, query) {
        return knex.client.transaction(async trx => {
            const products = await this.dao.search({
                knex: trx,
                where: query
            });

            if(products?.data.length) {
                await Promise.all([
                    this.ProductVariantService.addRelationToProducts(trx, products.data),
                    this.ProductArtistService.addRelationToProducts(trx, products.data)
                ]);

                this.addVirtuals(products.data);
            }

            return products;
        });
    }


    addVirtuals(products) {
        makeArray(products).forEach((prod) => {
            // packing_volume_cm
            prod.packing_volume_cm = (prod.packing_length_cm || 0)
                * (prod.packing_width_cm || 0)
                * (prod.packing_height_cm || 0);

            // total_inventory_count
            prod.total_inventory_count = (function(p) {
                let totalCount = 0;

                // https://bookshelfjs.org/api.html#Collection-instance-toArray
                const variants = makeArray(p.variants);
                if(variants.length) {
                    variants.forEach((obj) => {
                        totalCount += obj.total_inventory_count || 0;
                    })
                }

                return totalCount;
            })(prod);
        });

        return products;
    }

    // getValidationSchemaForAdd() {
    //     const schema = { ...super.getValidationSchemaForAdd() };
    //     schema.name = schema.name.required();
    //     schema.object = schema.object.required();

    //     return schema;
    // }


    getValidationSchemaForSearch() {
        const productSchema = this.dao.schema

        return {
            published: productSchema.published,
            sub_type: productSchema.sub_type,
            ...this.getValidationSchemaForPagination()
        };
    }

}
