export const services_api = {
    // 1. get all ProductGoods 
    getAllProductServices: {
        endpoint: `/api/v1/inventory/services/getservices/`,
        endpointKey: "get_all_productservices"
    },
    // 2. get ProductGoods through id
    getProductServices : {
        endpoint: `/api/v1/inventory/services/get/`,
        endpointKey: "get_productservices"
    },
    //  3. create ProductGood 
    createProductServices : {
        endpoint:  `/api/v1/inventory/services/create`,
        endpointKey: "create_productservices"
    },
    // 4. update ProductGoods through id
    updateProductServices : {
        endpoint:`/api/v1/inventory/services/update/`,
        endpointKey:"update_productservices"
    },
    // 5. delete ProductGoods
    deleteProductServices : {
        endpoint:`/api/v1/inventory/services/delete/`,
        endpointKey:"delete_productservices"
    },
    // 6. upload ProductGoods
    uploadProductServices : {
        endpoint:`/api/v1/inventory/services/upload`,
        endpointKey:"upload_productservices"
    }
};
