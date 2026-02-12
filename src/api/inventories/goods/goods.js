export const goodsApi = {
  // 0. get all searched ProductGoods
  getSearchedProductGoods: {
    endpoint: `/master-material/productgoods/search`,
    endpointKey: 'get_searched_productgoods',
  },
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
  // 9. item type list
  getItemTypes: {
    endpoint: `/master-material/productgoods/goods/list-types/`,
    endpointKey: 'item_types',
  },
  // 10. item type details
  getItemType: {
    endpoint: `/master-material/productgoods/goods/type-details/`,
    endpointKey: 'get_item_type',
  },
  // 11. item type manually creation
  createItemTypeManually: {
    endpoint: `/master-material/productgoods/goods/create-type`,
    endpointKey: 'create_Item_Types',
  },
  // 12. fetch item types
  fetchItemTypes: {
    endpoint: `/enterprise/fetch-goods-by-registration`,
    endpointKey: 'fetch_item_types',
  },
  // 13. add into item types
  addIntoItemTypes: {
    endpoint: `/master-material/productgoods/goods/bulk-create-type`,
    endpointKey: 'add_into_item_types',
  },
};
