import { addressAPIs } from '@/api/addressApi/addressApis';
import { APIinstance } from '@/services';

export const getAddress = (clientId, clientEnterpriseId) => {
  const queryParams = new URLSearchParams({ clientId });

  if (clientEnterpriseId) {
    queryParams.append('clientEnterpriseId', clientEnterpriseId);
  }

  return APIinstance.get(
    `${addressAPIs.getAddresses.endpoint}?${queryParams.toString()}`,
  );
};

export const getDataFromPinCode = (pincode) => {
  return APIinstance.get(
    `${addressAPIs.getAddressFromPincode.endpoint}?pincode=${pincode}`,
  );
};

export const addClientAddress = (data) => {
  return APIinstance.post(`${addressAPIs.addAddressClient.endpoint}`, data);
};

export const getGstAddressesList = (enterpriseGstId, clientId) => {
  return APIinstance.get(
    `${addressAPIs.getGstAddressesList.endpoint}${enterpriseGstId}/${clientId}`,
  );
};
