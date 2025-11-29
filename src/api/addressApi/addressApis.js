export const addressAPIs = {
  getAddresses: {
    endpoint: `/enterprise/client/get-address`,
    endpointKey: 'get_addresses',
  },
  getAddressFromPincode: {
    endpoint: `/pincode/get`,
    endpointKey: 'get_data_from_pincode',
  },
  addAddressClient: {
    endpoint: `/enterprise/client/save-address`,
    endpointKey: 'add_address_client',
  },
  getGstAddressesList: {
    endpoint: `/enterprise/gst-addresses/`,
    endpointKey: 'get_gst_addresses_list',
  },
};
