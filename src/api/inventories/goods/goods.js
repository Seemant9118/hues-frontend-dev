export const goodsApi = {
  // 1. get all ProductGoods
  getAllProductGoods: {
    endpoint: `/master-material/productgoods/getgoods/`,
    endpointKey: 'get_all_productgoods',
  },
  // 2. get ProductGoods through id
  getProductGoods: {
    endpoint: `/master-material/productgoods/get/`,
    endpointKey: 'get_productgoods',
  },
  //  3. create ProductGood
  createProductGoods: {
    endpoint: `/master-material/productgoods/create`,
    endpointKey: 'create_productgoods',
  },
  // 4. update ProductGoods through id
  updateProductGoods: {
    endpoint: `/master-material/productgoods/update/`,
    endpointKey: 'update_productgoods',
  },
  // 5. delete ProductGoods
  deleteProductGoods: {
    endpoint: `/master-material/productgoods/delete/`,
    endpointKey: 'delete_productgoods',
  },
  // 6. upload ProductGoods
  uploadProductGoods: {
    endpoint: `/master-material/productgoods/upload`,
    endpointKey: 'upload_productgoods',
  },
  // 7. getProductGoods of vendor
  vendorProductGoods: {
    endpoint: `/master-material/productgoods/vendor/getgoods/`,
    endpointKey: 'get_product_goods_vendor',
  },
  // 8. getGoodsSampleFile
  getGoodsSample: {
    endpoint: `/master-material/productgoods/downloadsamplefile`,
    endpointKey: 'get_goods_sample_file',
  },
};
