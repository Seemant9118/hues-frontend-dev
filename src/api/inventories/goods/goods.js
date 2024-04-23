export const goods_api = {
    // 1. get all ProductGoods 
    getAllProductGoods: {
        endpoint: `/api/v1/inventory/productgoods/getgoods`,
        endpointKey: "get_all_productgoods"
    },
    // 2. get ProductGoods through id
    getProductGoods : {
        endpoint: `/api/v1/inventory/productgoods/get/`,
        endpointKey: "get_productgoods"
    },
    //  3. create ProductGood 
    createProductGoods : {
        endpoint:  `/api/v1/inventory/productgoods/create`,
        endpointKey: "create_productgoods"
    },
    // 4. update ProductGoods through id
    updateProductGoods : {
        endpoint:`/api/v1/inventory/productgoods/update/`,
        endpointKey:"update_productgoods"
    },
    // 5. delete ProductGoods
    deleteProductGoods : {
        endpoint:`/api/v1/inventory/productgoods/delete/`,
        endpointKey:"delete_productgoods"
    },
    // 6. upload ProductGoods
    uploadProductGoods : {
        endpoint:`/api/v1/inventory/productgoods/upload`,
        endpointKey:"upload_productgoods"
    }
};
