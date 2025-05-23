import { servicesApi } from '@/api/inventories/services/services';
import { APIinstance } from '@/services';

export const GetSearchedServices = ({ page, limit, data }) => {
  return APIinstance.post(
    `${servicesApi.getSearchedServices.endpoint}?page=${page}&limit=${limit}`,
    data,
  );
};

export const GetAllProductServices = ({ id, page, limit }) => {
  return APIinstance.get(
    `${servicesApi.getAllProductServices.endpoint}${id}?page=${page}&limit=${limit}`,
  );
};

export const GetProductServices = (id) => {
  return APIinstance.get(`${servicesApi.getProductServices.endpoint}${id}`);
};

export const CreateProductServices = (data) => {
  return APIinstance.post(servicesApi.createProductServices.endpoint, data);
};

export const UpdateProductServices = (data, id) => {
  return APIinstance.put(
    `${servicesApi.updateProductServices.endpoint}${id}`,
    data,
  );
};

export const DeleteProductServices = ({ id }) => {
  return APIinstance.delete(
    `${servicesApi.deleteProductServices.endpoint}${id}`,
  );
};

export const UploadProductServices = (data) => {
  return APIinstance.post(servicesApi.uploadProductServices.endpoint, data);
};

export const GetServicesVendor = (id) => {
  return APIinstance.get(`${servicesApi.vendorServices.endpoint}${id}`);
};

export const GetServiceSampleFile = () => {
  return APIinstance.get(servicesApi.getServicesSample.endpoint);
};
