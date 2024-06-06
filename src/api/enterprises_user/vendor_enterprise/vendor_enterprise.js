export const vendorEnterprise = {
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
};
