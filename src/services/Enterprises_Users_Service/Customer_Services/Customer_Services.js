import { customerApis } from '@/api/enterprises_user/customers/customersApi';
import { APIinstance } from '@/services';

export const getCustomers = (id) => {
  return APIinstance.get(`${customerApis.getCustomers.endpoint}${id}`);
};

export const getCustomersByNumber = (identifier) => {
  return APIinstance.get(
    `${customerApis.getCustomersByNumber.endpoint}?indentifier=${identifier}`,
  );
};
