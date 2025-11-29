export const vendorEnterprise = {
  // 0. searched vendors
  searchedVendors: {
    endpoint: `/enterprise/vendor/searchvendor`,
    endpointKey: 'searched_vendors',
  },
  // 1. create vendor_enterprise
  createVendorEnterprise: {
    endpoint: `/enterprise/vendor/create`,
    endpointKey: 'create_vendor',
  },
  //   2. update vendor_enterprise
  updateVendorEnterprise: {
    endpoint: `/enterprise/vendor/update/`,
    endpointKey: 'update_vendor',
  },
  //   3. delete vendor_enterprise
  deleteVendorEnterprise: {
    endpoint: `/enterprise/vendor/delete/`,
    endpointKey: 'delete_vendor',
  },
  //   4. get vendor by id
  getVendor: {
    endpoint: `/enterprise/vendor/`,
    endpointKey: 'get_vendor',
  },
  //   5. get vendor list
  getVendors: {
    endpoint: `/enterprise/vendor/`,
    endpointKey: 'get_vendors',
  },
  // 6. bulk upload vendors
  bulkUploadVendors: {
    endpoint: `/enterprise/vendor/create/bulk`,
    endpointKey: 'bulk_upload_vendors',
  },
  // 7. getVendorSampleFile
  getVendorSample: {
    endpoint: `/enterprise/vendor/downloadsamplefile`,
    endpointKey: 'get_vendor_sample_file',
  },
};
