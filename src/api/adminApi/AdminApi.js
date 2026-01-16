export const AdminAPIs = {
  getAdminData: {
    endpoint: `/admin-panel/dashboard/get`,
    endpointKey: 'get_admin_data',
  },

  getEnterpriseSalesData: {
    endpoint: `/admin-panel/dashboard/enterprise/sales-data`,
    endpointKey: 'get_enterprise_sales_data',
  },

  getOnboardingData: {
    endpoint: `/admin-panel/dashboard/enterprise-onboarding-stats`,
    endpointKey: 'get_onboarding_data',
  },

  deleteEnterprise: {
    endpoint: `/admin-panel/dashboard/enterprises/delete/`,
    endpointKey: 'delete_enterprise',
  },

  addUser: {
    endpoint: `/admin-panel/dashboard/enterprises/users/create`,
    endpointKey: 'add_user',
  },

  updateUser: {
    endpoint: `/admin-panel/dashboard/enterprises/users/update`,
    endpointKey: 'edit_users',
  },

  addEnterprise: {
    endpoint: `/admin-panel/dashboard/enterprises/create`,
    endpointKey: 'add_enterprise',
  },

  getEnterpriseDetails: {
    endpoint: `/admin-panel/dashboard/enterprises/`,
    endpointKey: 'get_enterprise_details',
  },

  getJsonResponseData: {
    endpoint: `/admin-panel/dashboard/verification-data/`,
    endpointKey: 'get_json_res_data',
  },

  updateEnterpriseDetails: {
    endpoint: `/admin-panel/dashboard/enterprises/update-details/`,
    endpointKey: 'update_enterprise_details',
  },

  updateGST: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-gst/`,
    endpointKey: 'updateGst',
  },

  updateCIN: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-cin-llp/`,
    endpointKey: 'updateCIN',
  },

  updateUdyam: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-udyam/`,
    endpointKey: 'updateUdyam',
  },

  updatePAN: {
    endpoint: `/admin-panel/dashboard/enterprises/verify-pan/`,
    endpointKey: 'updatePAN',
  },

  addBankAccountOfEnterprise: {
    endpoint: `/admin-panel/dashboard/enterprises/add-bank-account/`,
    endpointKey: 'add_bank_account_enterprise',
  },

  updateAddresses: {
    endpoint: `/admin-panel/dashboard/enterprises/address/`,
    endpointKey: 'update_addresses',
  },

  addUpdateAddress: {
    endpoint: `/admin-panel/dashboard/enterprises/address/`,
    endpointKey: 'add_update_address',
  },

  getEnterprisedataFromPAN: {
    endpoint: `/admin-panel/dashboard/enterprises/pan`,
    endpointKey: 'get_enterprisedata_from_pan',
  },
  getEnterpriseDataFromGST: {
    endpoint: `/admin-panel/dashboard/enterprises/gst`,
    endpointKey: 'get_enterprise_data_from_gst',
  },
  getEnterpriseDataFromUDYAM: {
    endpoint: `/admin-panel/dashboard/enterprises/udyam`,
    endpointKey: 'get_enterprise_data_from_udyam',
  },
  getUserdataFromPAN: {
    endpoint: `/admin-panel/dashboard/user/pan`,
    endpointKey: 'get_userdata_from_pan',
  },
  getSearchedEnterprise: {
    endpoint: `/admin-panel/dashboard/enterprises/search`,
    endpointKey: 'get_searched_enterprise',
  },
  switchEnterprise: {
    endpoint: `/admin-panel/admin/enterprise/switch/`,
    endpointKey: 'switch_enterprise',
  },
  revertSwitchedEnterprise: {
    endpoint: `/admin-panel/admin/revert-token`,
    endpointKey: 'revert_enterprise',
  },

  // goods type
  getProductGoodsType: {
    endpoint: `/admin-panel/hsn-master/goods-hsn-master/search`,
    endpointKey: 'get_products_type',
  },

  // goods categories
  getProductGoodsCategories: {
    endpoint: `/admin-panel/hsn-master/categories`,
    endpointKey: 'get_product_goods-categories',
  },

  // services type
  getServicesType: {
    endpoint: `/admin-panel/hsn-master/services-sac-master/search`,
    endpointKey: 'get_services_type',
  },

  // admin-panel (masters)
  getGoodsMaster: {
    endpoint: `/admin-panel/hsn-master/goods-hsn-master/list`,
    endpointKey: 'get_goods_master',
  },

  createGoodsMaster: {
    endpoint: `/admin-panel/hsn-master/goods-hsn-master/add-item`,
    endpointKey: 'create_goods_master',
  },

  updateGoodsMaster: {
    endpoint: `/admin-panel/hsn-master/goods-hsn-master/update-item/`,
    endpointKey: 'update_goods_master',
  },

  getServicesMaster: {
    endpoint: `/admin-panel/hsn-master/services-sac-master/list`,
    endpointKey: 'get_goods_master',
  },

  createServiceMaster: {
    endpoint: `/admin-panel/hsn-master/services-sac-master/add-item`,
    endpointKey: 'get_goods_master',
  },

  updateSerivceMaster: {
    endpoint: `/admin-panel/hsn-master/services-sac-master/update-item`,
    endpointKey: 'update_service_master',
  },

  getCategories: {
    endpoint: `/admin-panel/hsn-master/categories`,
    endpointKey: 'get_categories',
  },
  createCategory: {
    endpoint: `/admin-panel/hsn-master/categories`,
    endpointKey: 'create_category',
  },
  updateCategory: {
    endpoint: `/admin-panel/hsn-master/categories/`,
    endpointKey: 'update_category',
  },

  getSubCategories: {
    endpoint: `/admin-panel/hsn-master/sub-categories/category`,
    endpointKey: 'get_sub_categories',
  },

  createSubCategory: {
    endpoint: `/admin-panel/hsn-master/sub-categories`,
    endpointKey: 'create_sub_category',
  },
  updateSubCategory: {
    endpoint: `/admin-panel/hsn-master/sub-categories/`,
    endpointKey: 'sub_Category_update',
  },
};
