import { batchApi } from '@/api/inventories/goods/batch';
import { APIinstance } from '@/services';

export const CreateProductBatch = (data) => {
  return APIinstance.post(batchApi.createBatch.endpoint, data);
};

export const GetProductBatchList = ({ searchString, skip, limit }) => {
  const params = {
    ...(searchString && { searchString }),
    ...(skip !== undefined && { skip }),
    ...(limit !== undefined && { limit }),
  };
  return APIinstance.get(batchApi.listBatches.endpoint, { params });
};

export const GetProductBatch = (publicId) => {
  return APIinstance.get(`${batchApi.getBatch.endpoint}${publicId}`);
};

export const UpdateProductBatch = ({ publicId, data }) => {
  return APIinstance.put(`${batchApi.updateBatch.endpoint}${publicId}`, data);
};

export const DeleteProductBatch = ({ id, type }) => {
  return APIinstance.delete(`${batchApi.deleteBatch.endpoint}${id}`, {
    data: { type },
  });
};
