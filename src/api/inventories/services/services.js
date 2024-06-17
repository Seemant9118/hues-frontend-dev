export const servicesApi = {
  // 1. get all Services
  getAllProductServices: {
    endpoint: `/inventory/services/getservices/`,
    endpointKey: 'get_all_productservices',
  },
  // 2. get Services through id
  getProductServices: {
    endpoint: `/inventory/services/get/`,
    endpointKey: 'get_productservices',
  },
  //  3. create Service
  createProductServices: {
    endpoint: `/inventory/services/create`,
    endpointKey: 'create_productservices',
  },
  // 4. update Service through id
  updateProductServices: {
    endpoint: `/inventory/services/update/`,
    endpointKey: 'update_productservices',
  },
  // 5. delete Service
  deleteProductServices: {
    endpoint: `/inventory/services/delete/`,
    endpointKey: 'delete_productservices',
  },
  // 6. upload Services
  uploadProductServices: {
    endpoint: `/inventory/services/upload`,
    endpointKey: 'upload_productservices',
  },
  // 7. getServices of vendor
  vendorServices: {
    endpoint: `/inventory/services/vendor/getservices/`,
    endpointKey: 'get_services_vendor',
  },
};
