import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { APIinstance } from '@/services';

export const getCustomers = ({ id, page, limit }) => {
  return APIinstance.get(
    `${customerApis.getCustomers.endpoint}${id}?page=${page}&limit=${limit}`,
  );
};

export const getCustomersByNumber = (identifier) => {
  if (identifier) {
    return APIinstance.get(
      `${customerApis.getCustomersByNumber.endpoint}?indentifier=${identifier}`,
    );
  } else {
    return APIinstance.get(customerApis.getCustomersByNumber.endpoint);
  }
};

export const getSearchedCustomers = ({ page, limit, data }) => {
  return APIinstance.post(
    `${customerApis.getSearchedCustomers.endpoint}?page=${page}&limit=${limit}`,
    data,
  );
};
