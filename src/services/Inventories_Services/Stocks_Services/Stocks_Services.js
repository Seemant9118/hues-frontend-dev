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
