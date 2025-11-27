import { AdminAPIs } from '@/api/adminApi/AdminApi';
import { APIinstance } from '@/services';
import moment from 'moment';

export const getAdminData = (dateRange) => {
  const [startDate, endDate] = dateRange;

  return APIinstance.post(`${AdminAPIs.getAdminData.endpoint}`, {
    startDate: moment(startDate).format('YYYY-MM-DD'),
    endDate: moment(endDate).format('YYYY-MM-DD'),
  });
};

export const getEnterprisesSalesData = ({ page, limit }) => {
  return APIinstance.get(
    `${AdminAPIs.getEnterpriseSalesData.endpoint}?page=${page}&limit=${limit}`,
  );
};

export const getOnboardingData = ({ page, limit }) => {
  return APIinstance.get(
    `${AdminAPIs.getOnboardingData.endpoint}?page=${page}&limit=${limit}`,
  );
};

export const addUser = (data) => {
  return APIinstance.post(AdminAPIs.addUser.endpoint, data);
};

export const updateUser = (data) => {
  return APIinstance.post(AdminAPIs.updateUser.endpoint, data);
};

export const addEnterprise = (data) => {
  return APIinstance.post(AdminAPIs.addEnterprise.endpoint, data);
};

export const getEnterpriseDetails = (id) => {
  return APIinstance.get(`${AdminAPIs.getEnterpriseDetails.endpoint}${id}`);
};

export const getEnterpriseResData = (id) => {
  return APIinstance.get(`${AdminAPIs.getJsonResponseData.endpoint}${id}`);
};

export const updateEnterpriseDetails = ({ id, data }) => {
  return APIinstance.post(
    `${AdminAPIs.updateEnterpriseDetails.endpoint}${id}`,
    data,
  );
};

export const updateGst = ({ id, data }) => {
  return APIinstance.post(`${AdminAPIs.updateGST.endpoint}${id}`, data);
};

export const updateCIN = ({ id, data }) => {
  return APIinstance.post(`${AdminAPIs.updateCIN.endpoint}${id}`, data);
};

export const updateUdyam = ({ id, data }) => {
  return APIinstance.post(`${AdminAPIs.updateUdyam.endpoint}${id}`, data);
};

export const updatePAN = ({ id, data }) => {
  return APIinstance.post(`${AdminAPIs.updatePAN.endpoint}${id}`, data);
};

export const addBankAccountForEnterprise = ({ id, data }) => {
  return APIinstance.post(
    `${AdminAPIs.addBankAccountOfEnterprise.endpoint}${id}`,
    data,
  );
};

export const updateAddressesForEnterprise = ({ id, data }) => {
  return APIinstance.post(`${AdminAPIs.updateAddresses.endpoint}${id}`, data);
};

export const addNUpdateAddress = ({ id, data }) => {
  return APIinstance.post(`${AdminAPIs.addUpdateAddress.endpoint}${id}`, data);
};

export const getEnterprisedataFromPAN = ({ type, panNumber }) => {
  return APIinstance.get(
    `${AdminAPIs.getEnterprisedataFromPAN.endpoint}?panNumber=${panNumber}&type=${type}`,
  );
};

export const getEnterprisedataFromGST = ({ gstNumber }) => {
  return APIinstance.get(
    `${AdminAPIs.getEnterpriseDataFromGST.endpoint}?gstNumber=${gstNumber}`,
  );
};

export const getEnterprisedataFromUDYAM = ({ udyam }) => {
  return APIinstance.get(
    `${AdminAPIs.getEnterpriseDataFromUDYAM.endpoint}?udyam=${udyam}`,
  );
};

export const getUserdataFromPAN = ({ panNumber }) => {
  return APIinstance.get(
    `${AdminAPIs.getUserdataFromPAN.endpoint}?panNumber=${panNumber}`,
  );
};

export const getSearchedEnterprises = (searchTerm) => {
  return APIinstance.get(
    `${AdminAPIs.getSearchedEnterprise.endpoint}?searchString=${searchTerm}`,
  );
};

export const switchEnterprise = ({ enterpriseId }) => {
  return APIinstance.get(
    `${AdminAPIs.switchEnterprise.endpoint}${enterpriseId}`,
  );
};

export const revertSwitchedEnterprise = () => {
  return APIinstance.get(AdminAPIs.revertSwitchedEnterprise.endpoint);
};
