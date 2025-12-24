import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { APIinstance } from '@/services';

export const getMaterialMovementStocks = ({ page, limit, filter }) => {
  return APIinstance.get(
    `${stockApis.getMaterialMovementStocks.endpoint}?page=${page}&limit=${limit}&filter=${filter}`,
  );
};

export const getMaterialMovementStock = ({ id }) => {
  return APIinstance.get(`${stockApis.getMaterialMovmentStock.endpoint}${id}`);
};

export const getStocksItems = ({ enterpriseId, filter, page, limit }) => {
  const endpoint = stockApis.getStocksItems.endpoint.replace(
    ':enterpriseId',
    enterpriseId,
  );

  const params = {
    page,
    limit,
    ...(filter ? { bucketName: filter } : {}),
  };

  return APIinstance.get(endpoint, { params });
};
