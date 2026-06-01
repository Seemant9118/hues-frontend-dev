export const customerApis = {
  getCustomers: {
    endpoint: `/enterprise/customer/`,
    endpointKey: 'get_Customers',
  },
  getCustomersByNumber: {
    endpoint: `/enterprise/customer/search`,
    endpointKey: 'get_customers_number',
  },
  getSearchedCustomers: {
    endpoint: `/enterprise/customer/searchcustomer`,
    endpointKey: 'get_searched_csutomers',
  },
  getCustomer: {
    endpoint: `/enterprise/customer/get/`,
    endpointKey: 'get_customer',
  },
  getCustomerLedger: {
    endpoint: `/financial-summary/customer/`,
    endpointKey: 'get_customer_ledger',
  },
};
