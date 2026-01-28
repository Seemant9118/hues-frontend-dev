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

export const deleteEnterprise = ({ id }) => {
  return APIinstance.post(`${AdminAPIs.deleteEnterprise.endpoint}${id}`);
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
// goods type
export const getGoodsType = ({ page, limit, searchString }) => {
  const baseEndpoint = AdminAPIs.getProductGoodsType.endpoint;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
    ...(searchString && { searchString }),
  };

  return APIinstance.get(baseEndpoint, { params });
};

// goods categories
export const getProductGoodsCategories = () => {
  return APIinstance.get(AdminAPIs.getProductGoodsCategories.endpoint);
};

// services type
export const getServicesType = ({ page, limit, searchString }) => {
  const baseEndpoint = AdminAPIs.getServicesType.endpoint;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
    ...(searchString && { searchString }),
  };

  return APIinstance.get(baseEndpoint, { params });
};

// admin-panel (masters)
export const getGoodsMaster = ({ page, limit }) => {
  const baseEndpoint = AdminAPIs.getGoodsMaster.endpoint;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
  };

  return APIinstance.get(baseEndpoint, { params });
};

export const createGoodsMaster = ({ data }) => {
  return APIinstance.post(AdminAPIs.createGoodsMaster.endpoint, data);
};

export const updateGoodsMaster = ({ data }) => {
  return APIinstance.put(`${AdminAPIs.updateGoodsMaster.endpoint}`, data);
};

export const uploadGoodsMaster = ({ data }) => {
  return APIinstance.post(AdminAPIs.uploadGoodsMaster.endpoint, data);
};

export const deleteGoodsMaster = ({ id }) => {
  return APIinstance.delete(`${AdminAPIs.deleteGoodsMaster.endpoint}${id}`);
};

export const downloadSampleFileGoodsMaster = () => {
  return APIinstance.get(AdminAPIs.downloadSampleFileGoodsMaster.endpoint);
};

export const getServicesMaster = ({ page, limit }) => {
  const baseEndpoint = AdminAPIs.getServicesMaster.endpoint;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
  };

  return APIinstance.get(baseEndpoint, { params });
};

export const createServiceMaster = ({ data }) => {
  return APIinstance.post(AdminAPIs.createServiceMaster.endpoint, data);
};

export const updateServiceMaster = ({ data }) => {
  return APIinstance.put(AdminAPIs.updateServiceMaster.endpoint, data);
};

export const deleteServiceMaster = ({ id }) => {
  return APIinstance.delete(`${AdminAPIs.deleteServiceMaster.endpoint}${id}`);
};

export const uploadServiceMaster = ({ data }) => {
  return APIinstance.post(AdminAPIs.uploadServiceMaster.endpoint, data);
};

export const downloadSampleFileServiceMaster = () => {
  return APIinstance.get(AdminAPIs.downloadSampleFileServiceMaster.endpoint);
};

export const getCategories = ({ page, limit }) => {
  const baseEndpoint = AdminAPIs.getCategories.endpoint;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
  };

  return APIinstance.get(baseEndpoint, { params });
};

export const createCategory = ({ data }) => {
  return APIinstance.post(AdminAPIs.createCategory.endpoint, data);
};

export const updateCategory = ({ id, data }) => {
  return APIinstance.put(`${AdminAPIs.updateCategory.endpoint}${id}`, data);
};

export const deleteCategory = ({ id }) => {
  return APIinstance.delete(`${AdminAPIs.deleteCategory.endpoint}${id}`);
};

export const getSubCategories = ({ page, limit }) => {
  const baseEndpoint = AdminAPIs.getSubCategories.endpoint;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
  };

  return APIinstance.get(baseEndpoint, { params });
};

export const createSubCategory = ({ data }) => {
  return APIinstance.post(AdminAPIs.createSubCategory.endpoint, data);
};

export const updateSubCategory = ({ id, data }) => {
  return APIinstance.put(`${AdminAPIs.updateSubCategory.endpoint}${id}`, data);
};

export const deleteSubCategory = ({ id }) => {
  return APIinstance.delete(`${AdminAPIs.deleteSubCategory.endpoint}${id}`);
};

export const sendMessage = ({ data }) => {
  return APIinstance.post(AdminAPIs.sendMessage.endpoint, data);
};

export const getMessages = ({ page, limit }) => {
  return APIinstance.get(
    `${AdminAPIs.getContactedMessages.endpoint}?page=${page}&limit=${limit}`,
  );
};

export const getMessage = ({ id }) => {
  return APIinstance.get(`${AdminAPIs.getContactedMessage.endpoint}${id}`);
};
