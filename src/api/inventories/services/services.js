export const servicesApi = {
  // 1. get all Services
  getAllProductServices: {
    endpoint: `/master-material/services/getservices/`,
    endpointKey: 'get_all_productservices',
  },
  // 2. get Services through id
  getProductServices: {
    endpoint: `/master-material/services/get/`,
    endpointKey: 'get_productservices',
  },
  //  3. create Service
  createProductServices: {
    endpoint: `/master-material/services/create`,
    endpointKey: 'create_productservices',
  },
  // 4. update Service through id
  updateProductServices: {
    endpoint: `/master-material/services/update/`,
    endpointKey: 'update_productservices',
  },
  // 5. delete Service
  deleteProductServices: {
    endpoint: `/master-material/services/delete/`,
    endpointKey: 'delete_productservices',
  },
  // 6. upload Services
  uploadProductServices: {
    endpoint: `/master-material/services/upload`,
    endpointKey: 'upload_productservices',
  },
  // 7. getServices of vendor
  vendorServices: {
    endpoint: `/master-material/services/vendor/getservices/`,
    endpointKey: 'get_services_vendor',
  },
  // 8. getServicesSampleFile
  getServicesSample: {
    endpoint: `/master-material/services/downloadsamplefile`,
    endpointKey: 'get_services_sample_file',
  },
};
