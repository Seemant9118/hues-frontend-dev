export const goodsApi = {
  // 1. get all ProductGoods
  getAllProductGoods: {
    endpoint: `/inventory/productgoods/getgoods/`,
    endpointKey: 'get_all_productgoods',
  },
  // 2. get ProductGoods through id
  getProductGoods: {
    endpoint: `/inventory/productgoods/get/`,
    endpointKey: 'get_productgoods',
  },
  //  3. create ProductGood
  createProductGoods: {
    endpoint: `/inventory/productgoods/create`,
    endpointKey: 'create_productgoods',
  },
  // 4. update ProductGoods through id
  updateProductGoods: {
    endpoint: `/inventory/productgoods/update/`,
    endpointKey: 'update_productgoods',
  },
  // 5. delete ProductGoods
  deleteProductGoods: {
    endpoint: `/inventory/productgoods/delete/`,
    endpointKey: 'delete_productgoods',
  },
  // 6. upload ProductGoods
  uploadProductGoods: {
    endpoint: `/inventory/productgoods/upload`,
    endpointKey: 'upload_productgoods',
  },
  // 7. getProductGoods of vendor
  vendorProductGoods: {
    endpoint: `/inventory/productgoods/vendor/getgoods/`,
    endpointKey: 'get_product_goods_vendor',
  },
};
