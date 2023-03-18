const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const PackageService = require('./PackageService');


function mockProduct(length, width, height, shipAlone) {
    return {
        packing_length_cm: length,
        packing_width_cm: width,
        packing_height_cm: height,
        packing_volume_cm: (length * width * height),
        ship_alone: shipAlone ? true : false
    }
}

function mockBox(length, width, height) {
    return {
        length_cm: length,
        width_cm: width,
        height_cm: height,
        volume_cm: (length * width * height)
    }
}



describe('PackageService.fitItems()', () => {

    it('should return a positive number of fits when all of a products length/width/height is less than the containers length/width/height', async () => {
        const product = mockProduct(3, 2, 1);
        const box = mockBox(4, 3, 2);
        const result = PackageService.doesItFit(product, box);

        expect(result.fitItems, 'fitItems').to.be.greaterThan(0);
    });

    it('should return zero fits when a product length is > the container length', async () => {
        const product = mockProduct(5, 2, 1);
        const box = mockBox(4, 2, 1);
        const result = PackageService.doesItFit(product, box);

        expect(result.fitItems, 'fitItems').to.equal(0);
    });

    it('should return zero fits when a product width is > the container width', async () => {
        const product = mockProduct(3, 5, 1);
        const box = mockBox(4, 3, 2);
        const result = PackageService.doesItFit(product, box);

        expect(result.fitItems, 'fitItems').to.equal(0);
    });

    it('should return zero fits when a product height is > the container height', async () => {
        const product = mockProduct(3, 2, 3);
        const box = mockBox(4, 3, 2);
        const result = PackageService.doesItFit(product, box);

        expect(result.fitItems, 'fitItems').to.equal(0);
    });

});


describe('PackageService.pickSmallestBoxForProduct()', () => {

    it('should return the perfect match box in the list of boxes', async () => {
        const product = mockProduct(1, 3, 1);
        const boxes = [
            mockBox(1, 3, 1), // <--- should be this one
            mockBox(1, 4, 1), // fits, but too wide
            mockBox(1, 3, 2), // fits, too tall
            mockBox(1, 2, 1) // doesn't fit at all
        ];
        const result = PackageService.pickSmallestBoxForProduct(product, boxes);

        expect(result.length_cm, 'length_cm').to.equal(1);
        expect(result.width_cm, 'width_cm').to.equal(3);
        expect(result.height_cm, 'height_cm').to.equal(1);
    });


    it('should return the smallest avail box when a perfect match is not available', async () => {
        const product = mockProduct(1, 3, 1);
        const boxes = [
            mockBox(1, 4, 1), // <--- fits (too wide), but has the smallest volume (4)
            mockBox(1, 3, 2), // fits (too tall) but volume is greater than above (6)
            mockBox(1, 2, 1) // doesn't fit at all
        ];
        const result = PackageService.pickSmallestBoxForProduct(product, boxes);

        expect(result.length_cm, 'length_cm').to.equal(1);
        expect(result.width_cm, 'width_cm').to.equal(4);
        expect(result.height_cm, 'height_cm').to.equal(1);
    });


    it('should return null when the product does not fit into any of the boxes', async () => {
        const product = mockProduct(2, 3, 1);
        const boxes = [
            mockBox(2, 2, 1),
            mockBox(2, 1, 2),
            mockBox(1, 1, 1)
        ];
        const result = PackageService.pickSmallestBoxForProduct(product, boxes);

        expect(result).to.equal(null);
    });

});


describe('PackageService.getAllBoxesThatFitProduct()', () => {

    it('should return all boxes that fit a product', async () => {
        const product = mockProduct(2, 3, 1);
        const boxes = [
            mockBox(2, 3, 1), // exact fit
            mockBox(2, 4, 1), // fits but wider
            mockBox(2, 3, 2), // fits but taller
            mockBox(3, 3, 1), // fits but longer
            mockBox(2, 1, 2), // doesn't fit
            mockBox(1, 1, 1)  // doesn't fit
        ];
        const result = PackageService.getAllBoxesThatFitProduct(product, boxes);

        expect(result.length).to.equal(4);
        expect(result[0].length_cm).to.equal(2);
        expect(result[0].width_cm).to.equal(3);
        expect(result[0].height_cm).to.equal(1);
    });


    it('should return an empth array if no boxes fit a product', async () => {
        const product = mockProduct(2, 3, 1);
        const boxes = [
            mockBox(2, 1, 2), // doesn't fit
            mockBox(1, 1, 1)  // doesn't fit
        ];
        const result = PackageService.getAllBoxesThatFitProduct(product, boxes);

        expect(result.length).to.equal(0);
    });


    it('the first result should be the best fitting box when an exact match box is not available', async () => {
        const product = mockProduct(2, 3, 1);
        const boxes = [
            mockBox(2, 3, 2), // fits but taller
            mockBox(3, 3, 1),  // fits but longer
            mockBox(2, 4, 1),  // fits but wider <--- closest match
            mockBox(2, 1, 2),  // doesn't fit
            mockBox(1, 1, 1),  // doesn't fit
        ];
        const result = PackageService.getAllBoxesThatFitProduct(product, boxes);

        expect(result[0].length_cm).to.equal(2);
        expect(result[0].width_cm).to.equal(4);
        expect(result[0].height_cm).to.equal(1);
    });
});


describe('PackageService.sortProductsByVolume()', () => {
    const mixedProds = [
        mockProduct(1, 1, 1), // 1
        mockProduct(4, 4, 4), // 64
        mockProduct(2, 2, 2), // 8
        mockProduct(4, 1, 2), // 8
        mockProduct(3, 3, 3), // 27
    ]

    it('should sort in ascending order', async () => {
        const result = PackageService.sortProductsByVolume(mixedProds, true);

        expect(result[0].packing_volume_cm).to.equal(1);
        expect(result[1].packing_volume_cm).to.equal(8);
        expect(result[2].packing_volume_cm).to.equal(8);
        expect(result[3].packing_volume_cm).to.equal(27);
        expect(result[4].packing_volume_cm).to.equal(64);
    });

    it('should sort in descending order', async () => {
        const result = PackageService.sortProductsByVolume(mixedProds, false);

        expect(result[0].packing_volume_cm).to.equal(64);
        expect(result[1].packing_volume_cm).to.equal(27);
        expect(result[2].packing_volume_cm).to.equal(8);
        expect(result[3].packing_volume_cm).to.equal(8);
        expect(result[4].packing_volume_cm).to.equal(1);
    });
});


describe('PackageService.addProductsToBox()', () => {
    it('should add one product to the box with no remaining volume', async () => {
        const products = [
            mockProduct(1, 1, 1)
        ];
        const box = mockBox(1, 1, 1);
        const result = PackageService.addProductsToBox(products, box);

        expect(result.packed.length).to.equal(1);
        expect(result.unpacked.length).to.equal(0);
        expect(result.remainingVolume).to.equal(0);
    });

    it('should not add any products to the box because the products dont fit', async () => {
        const products = [
            mockProduct(2, 1, 1)
        ];
        const box = mockBox(1, 1, 1);
        const result = PackageService.addProductsToBox(products, box);

        expect(result.packed.length).to.equal(0);
        expect(result.unpacked.length).to.equal(1);
        expect(result.remainingVolume).to.equal(1);
    });

    it('should add one product to the box with one unpacked product', async () => {
        const products = [
            mockProduct(3, 2, 1), // 6
            mockProduct(3, 2, 2) // 12
        ];
        const box = mockBox(3, 2, 2); // 12
        const result = PackageService.addProductsToBox(products, box);

        expect(result.packed.length).to.equal(1);
        expect(result.packed[0].packing_length_cm).to.equal(3);
        expect(result.packed[0].packing_width_cm).to.equal(2);
        expect(result.packed[0].packing_height_cm).to.equal(1);

        expect(result.unpacked.length).to.equal(1);
        expect(result.unpacked[0].packing_length_cm).to.equal(3);
        expect(result.unpacked[0].packing_width_cm).to.equal(2);
        expect(result.unpacked[0].packing_height_cm).to.equal(2);

        expect(result.remainingVolume).to.equal(6);
    });

    it('should add two products to the box with no unpacked products', async () => {
        const products = [
            mockProduct(3, 2, 1), // 6
            mockProduct(3, 2, 2) // 12
        ];
        const box = mockBox(3, 2, 4); // 24
        const result = PackageService.addProductsToBox(products, box);

        expect(result.packed.length).to.equal(2);
        expect(result.unpacked.length).to.equal(0);
        expect(result.remainingVolume).to.equal(6);
    });

    it('should add two products to the box with one unpacked product because of no remaining volume', async () => {
        const products = [
            mockProduct(3, 2, 1), // 6
            mockProduct(3, 2, 2), // 12
            mockProduct(3, 2, 2) // 12
        ];
        const box = mockBox(3, 2, 4); // 24
        const result = PackageService.addProductsToBox(products, box);

        // console.log("addProductsToBox", result)
        expect(result.packed.length).to.equal(2);
        expect(result.unpacked.length).to.equal(1);
        expect(result.remainingVolume).to.equal(6);
    });

    // it(`should add one product to each box even though both products fit in a single box
    //     because one product has "ship_alone" = true`, async () => {
    //     const products = [
    //         mockProduct(3, 2, 1), // 6
    //         mockProduct(3, 2, 2, true), // 12
    //     ];
    //     const box = mockBox(3, 2, 4); // 24
    //     const result = PackageService.addProductsToBox(products, box);

    //     console.log("addProductsToBox", result)

    //     expect(result.packed.length).to.equal(2);
    //     expect(result.unpacked.length).to.equal(1);
    //     expect(result.remainingVolume).to.equal(6);
    // });
});


describe('PackageService.productsWithoutSuitableBox()', () => {
    const prods = [
        mockProduct(3, 2, 1), // 6
        mockProduct(3, 2, 2), // 12
        mockProduct(3, 2, 2) // 12
    ];

    it('should return an empty array when all products have a suitable box ', async () => {
        const boxes = [
            mockBox(3, 2, 3) // 18
        ]
        const result = PackageService.productsWithoutSuitableBox(prods, boxes);

        // console.log("productsWithoutSuitableBox", result)
        expect(result.length).to.equal(0);
    });

    it('should return an array with 3 indexes when no products have a suitable box', async () => {
        const boxes = [
            mockBox(1, 2, 1) // 2
        ]
        const result = PackageService.productsWithoutSuitableBox(prods, boxes);

        expect(result.length).to.equal(prods.length);
    });

    it('should return an array with 1 index', async () => {
        const boxes = [
            mockBox(3, 2, 1) // 6
        ]
        const result = PackageService.productsWithoutSuitableBox(prods, boxes);

        expect(result[0]).to.equal(1);
        expect(result[1]).to.equal(2);
    });

    it('should return an array with 2 indexes', async () => {
        const products = [
            mockProduct(7, 2, 1, true), // 14
            mockProduct(3, 7, 2, true) // 14
        ];
        const boxes = [
            mockBox(3, 2, 2), // 12
            mockBox(3, 1, 6), // 18
            mockBox(3, 4, 4) // 48
        ];
        const result = PackageService.productsWithoutSuitableBox(products, boxes);

        expect(result[0]).to.equal(0);
        expect(result[1]).to.equal(1);
    });
});


describe('PackageService.packProducts()', () => {

    function logPackProductsResult(result) {
        result.packed.forEach((obj, idx) => {
            console.log(`PACKED ${idx}`, obj)
        });
        result.unpacked.forEach((obj, idx) => {
            console.log(`UNPACKED ${idx}`, obj)
        });
    }

    it('should PACK a single product into a box of the same size', async () => {
        const products = [
            mockProduct(3, 2, 1)
        ];
        const boxes = [
            mockBox(3, 2, 4),
            mockBox(3, 2, 5),
            mockBox(3, 2, 6),
            mockBox(3, 2, 1)  // <----
        ];
        const results = PackageService.packProducts(products, boxes);

        expect(results.packed.length).to.equal(1);
        expect(results.unpacked.length).to.equal(0);
        expect(results.packed[0].box.volume_cm).to.equal(6);
    });


    it('should PACK a single product into the best available box', async () => {
        const products = [
            mockProduct(3, 2, 1)
        ];
        const boxes = [
            mockBox(3, 2, 4), // <----
            mockBox(3, 2, 5),
            mockBox(3, 2, 6)
        ];
        const results = PackageService.packProducts(products, boxes);

        expect(results.packed.length).to.equal(1);
        expect(results.unpacked.length).to.equal(0);
        expect(results.packed[0].box.volume_cm).to.equal(24);
    });

    it('should PACK a single product with "ship_alone" into a box of the same size', async () => {
        const products = [
            mockProduct(3, 2, 1, true)
        ];
        const boxes = [
            mockBox(3, 2, 4),
            mockBox(3, 2, 5),
            mockBox(3, 2, 6),
            mockBox(3, 2, 1) // <----
        ];
        const results = PackageService.packProducts(products, boxes);

        expect(results.packed.length).to.equal(1);
        expect(results.unpacked.length).to.equal(0);
        expect(results.packed[0].box.volume_cm).to.equal(6);
    });

    it('should PACK a single product with "ship_alone" into the best available box', async () => {
        const products = [
            mockProduct(3, 2, 1, true)
        ];

        const boxes = [
            mockBox(3, 2, 4), // <----
            mockBox(3, 2, 5),
            mockBox(3, 2, 6)
        ];

        const results = PackageService.packProducts(products, boxes);

        expect(results.packed.length).to.equal(1);
        expect(results.unpacked.length).to.equal(0);
        expect(results.packed[0].box.volume_cm).to.equal(24);
    });


    it('should PACK all products into a single box that fits them', async () => {
        const products = [
            mockProduct(3, 2, 1), // 6
            mockProduct(3, 2, 2), // 12
            mockProduct(3, 2, 2) // 12
        ];
        const boxes = [
            mockBox(3, 2, 4), // 24
            mockBox(3, 2, 5), // 30 <----
            mockBox(3, 2, 6), // 36
            mockBox(3, 2, 1) // 6
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.packed.length).to.equal(1);
        expect(results.unpacked.length).to.equal(0);

        expect(results.packed[0].box.volume_cm).to.equal(30);
        expect(results.packed[0].remainingVolume).to.equal(0);
    });


    it('should pack all products that are not "ship_alone" into a single box, and the "ship_alone" product should be in its own box', async () => {
        const products = [
            mockProduct(3, 2, 1), // 6
            mockProduct(3, 2, 2), // 12
            mockProduct(3, 2, 2), // 12
            mockProduct(3, 2, 1, true),
        ];
        const boxes = [
            mockBox(3, 2, 4), // 24 <----
            mockBox(3, 2, 5), // 30
            mockBox(3, 2, 6), // 36
            mockBox(3, 2, 1) // 6 <----
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.packed.length).to.equal(2);
        expect(results.unpacked.length).to.equal(0);

        // the ship_alone results return first
        expect(results.packed[0].box.volume_cm).to.equal(6);
        expect(results.packed[0].remainingVolume).to.equal(0);

        expect(results.packed[1].box.volume_cm).to.equal(30);
        expect(results.packed[1].remainingVolume).to.equal(0);
    });


    it('should pack multiple "ship_alone" products into their own box of the same size', async () => {
        const products = [
            mockProduct(3, 2, 1, true),
            mockProduct(3, 3, 2, true),
            mockProduct(3, 4, 2, true)
        ];
        const boxes = [
            mockBox(3, 2, 1),
            mockBox(3, 3, 2),
            mockBox(3, 4, 2),
            mockBox(3, 2, 5),
            mockBox(3, 2, 6)
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.packed.length).to.equal(3);
        expect(results.unpacked.length).to.equal(0);

        // the ship_alone results return first
        expect(results.packed[0].box.volume_cm).to.equal(6);
        expect(results.packed[0].remainingVolume).to.equal(0);

        expect(results.packed[1].box.volume_cm).to.equal(18);
        expect(results.packed[1].remainingVolume).to.equal(0);

        expect(results.packed[2].box.volume_cm).to.equal(24);
        expect(results.packed[2].remainingVolume).to.equal(0);
    });


    it('should pack multiple "ship_alone" products into their own box of the closest size', async () => {
        const products = [
            mockProduct(3, 2, 1, true), // 6
            mockProduct(3, 3, 2, true), // 18
            mockProduct(3, 4, 2, true)  // 24
        ];
        const boxes = [
            mockBox(3, 2, 2), // 12
            mockBox(3, 1, 6), // 18
            mockBox(3, 4, 4) // 48
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results)

        expect(results.packed.length).to.equal(3);
        expect(results.unpacked.length).to.equal(0);

        // the ship_alone results return first
        expect(results.packed[0].box.volume_cm).to.equal(12);
        expect(results.packed[0].remainingVolume).to.equal(6);

        expect(results.packed[1].box.volume_cm).to.equal(48);
        expect(results.packed[1].remainingVolume).to.equal(30);

        expect(results.packed[2].box.volume_cm).to.equal(48);
        expect(results.packed[2].remainingVolume).to.equal(24);
    });


    it('should not pack a single product because a suitable box was not provided', async () => {
        const products = [
            mockProduct(7, 2, 1) // 14
        ];
        const boxes = [
            mockBox(3, 2, 2), // 12
            mockBox(3, 1, 6), // 18
            mockBox(3, 4, 4) // 48
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.unpacked.length).to.equal(1);
        expect(results.unpacked[0].packing_volume_cm).to.equal(14);
    });


    it('should not pack multiple products because a suitable box was not provided', async () => {
        const products = [
            mockProduct(7, 2, 1), // 14
            mockProduct(7, 3, 1), // 21
            mockProduct(7, 4, 1) // 28
        ];
        const boxes = [
            mockBox(3, 2, 2), // 12
            mockBox(3, 1, 6), // 18
            mockBox(3, 4, 4) // 48
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.unpacked.length).to.equal(3);
        expect(results.unpacked[0].packing_volume_cm).to.equal(28);
        expect(results.unpacked[1].packing_volume_cm).to.equal(21);
        expect(results.unpacked[2].packing_volume_cm).to.equal(14);
    });

    it('should not pack a single "ship_alone" product because a suitable size was not provided', async () => {
        const products = [
            mockProduct(7, 2, 1, true) // 14
        ];
        const boxes = [
            mockBox(3, 2, 2), // 12
            mockBox(3, 1, 6), // 18
            mockBox(3, 4, 4) // 48
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.packed.length).to.equal(0);
        expect(results.unpacked.length).to.equal(1);
        expect(results.unpacked[0].packing_volume_cm).to.equal(14);
    });


    it('should not pack multiple "ship_alone" product because a suitable size was not provided', async () => {
        const products = [
            mockProduct(7, 2, 1, true), // 14
            mockProduct(3, 7, 2, true), // 42
            mockProduct(3, 7, 3, true), // 63
            mockProduct(3, 7, 4, true), // 84
        ];
        const boxes = [
            mockBox(3, 2, 2), // 12
            mockBox(3, 1, 6), // 18
            mockBox(3, 4, 4) // 48
        ];
        const results = PackageService.packProducts(products, boxes);

        // logPackProductsResult(results);

        expect(results.packed.length).to.equal(0);
        expect(results.unpacked.length).to.equal(4);
        expect(results.unpacked[0].packing_volume_cm).to.equal(84);
        expect(results.unpacked[1].packing_volume_cm).to.equal(63);
        expect(results.unpacked[2].packing_volume_cm).to.equal(42);
        expect(results.unpacked[3].packing_volume_cm).to.equal(14);
    });

});


