import { goodsApi } from '@/api/inventories/goods/goods';
import { APIinstance } from '@/services';

export const GetSearchedProductGoods = (str) => {
  return APIinstance.post(
    `${goodsApi.getSearchedProductGoods.endpoint}?searchString=${str}`,
  );
};

export const GetAllProductGoods = (id) => {
  return APIinstance.get(`${goodsApi.getAllProductGoods.endpoint}${id}`);
};

export const GetProductGoods = (id) => {
  return APIinstance.get(`${goodsApi.getProductGoods.endpoint}${id}`);
};

export const CreateProductGoods = (data) => {
  return APIinstance.post(goodsApi.createProductGoods.endpoint, data);
};

export const UpdateProductGoods = (data, id) => {
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
