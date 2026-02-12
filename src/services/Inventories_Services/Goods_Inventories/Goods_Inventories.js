import { goodsApi } from '@/api/inventories/goods/goods';
import { APIinstance } from '@/services';

export const GetSearchedProductGoods = ({ page, limit, data }) => {
  return APIinstance.post(
    `${goodsApi.getSearchedProductGoods.endpoint}?page=${page}&limit=${limit}`,
    data,
  );
};

export const GetAllProductGoods = ({ id, page, limit }) => {
  const { endpoint } = goodsApi.getAllProductGoods;

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
  };
  return APIinstance.get(`${endpoint}${id}`, { params });
};

export const GetProductGoods = (id) => {
  return APIinstance.get(`${goodsApi.getProductGoods.endpoint}${id}`);
};

export const CreateProductGoods = (data) => {
  return APIinstance.post(goodsApi.createProductGoods.endpoint, data);
};

export const UpdateProductGoods = ({ id, data }) => {
  return APIinstance.put(`${goodsApi.updateProductGoods.endpoint}${id}`, data);
};

export const DeleteProductGoods = ({ id }) => {
  return APIinstance.delete(`${goodsApi.deleteProductGoods.endpoint}${id}`);
};

export const UploadProductGoods = (data) => {
  return APIinstance.post(goodsApi.uploadProductGoods.endpoint, data);
};

export const GetProductGoodsVendor = (id) => {
  return APIinstance.get(`${goodsApi.vendorProductGoods.endpoint}${id}`);
};

export const GetGoodsSampleFile = () => {
  return APIinstance.get(goodsApi.getGoodsSample.endpoint);
};

export const getItemsTypes = ({ id, page, limit }) => {
  return APIinstance.get(
    `${goodsApi.getItemTypes.endpoint}${id}?page=${page}&limit=${limit}`,
  );
};

export const getItemType = ({ id }) => {
  return APIinstance.get(`${goodsApi.getItemType.endpoint}${id}`);
};

export const createItemTypeManually = ({ data }) => {
  return APIinstance.post(goodsApi.createItemTypeManually.endpoint, data);
};

export const fetchItemTypes = ({ data }) => {
  return APIinstance.post(goodsApi.fetchItemTypes.endpoint, data);
};

export const addIntoTypes = ({ data }) => {
  return APIinstance.post(goodsApi.addIntoItemTypes.endpoint, data);
};
