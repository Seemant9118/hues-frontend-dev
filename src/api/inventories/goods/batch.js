export const batchApi = {
  // 1. create Product Batch
  createBatch: {
    endpoint: `/master-material/productgoods/batch/create`,
    endpointKey: 'create_product_batch',
  },
  // 2. get Product Batch List
  listBatches: {
    endpoint: `/master-material/productgoods/batch/list`,
    endpointKey: 'get_product_batches',
  },
  // 3. get Product Batch By Public Id
  getBatch: {
    endpoint: `/master-material/productgoods/batch/`,
    endpointKey: 'get_product_batch',
  },
  // 4. update Product Batch
  updateBatch: {
    endpoint: `/master-material/productgoods/batch/update/`,
    endpointKey: 'update_product_batch',
  },
  // 5. delete Product Batch
  deleteBatch: {
    endpoint: `/master-material/productgoods/batch/delete/`,
    endpointKey: 'delete_product_batch',
  },
};
