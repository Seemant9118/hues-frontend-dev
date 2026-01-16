import { stockApis } from '@/api/inventories/stocks/stocksApi';
import { APIinstance } from '@/services';

export const getMaterialMovementStocks = ({
  page,
  limit,
  filter,
  searchString,
}) => {
  return APIinstance.get(stockApis.getMaterialMovementStocks.endpoint, {
    params: {
      page,
      limit,
      ...(filter && { filter }),
      ...(searchString !== undefined && { searchString }),
    },
  });
};

export const getMaterialMovementStock = ({ id }) => {
  return APIinstance.get(`${stockApis.getMaterialMovmentStock.endpoint}${id}`);
};

export const getStocksItems = ({
  enterpriseId,
  page,
  limit,
  filter,
  searchString,
}) => {
  const endpoint = stockApis.getStocksItems.endpoint.replace(
    ':enterpriseId',
    enterpriseId,
  );

  const params = {
    page,
    limit,
    ...(filter ? { bucketName: filter } : {}),
    ...(searchString !== undefined && { searchString }),
  };

  return APIinstance.get(endpoint, { params });
};

export const getStockDetails = ({
  enterpriseId,
  inventoryItemId,
  page,
  limit,
}) => {
  const endpoint = stockApis.getStockDetails.endpoint
    .replace(':enterpriseId', enterpriseId)
    .replace(':inventoryItemId', inventoryItemId);

  const params = {
    ...(page && { page }),
    ...(limit && { limit }),
  };

  return APIinstance.get(endpoint, { params });
};

export const adHocStockIn = ({ enterpriseId, data }) => {
  return APIinstance.post(
    `${stockApis.adHocStockIn.endpoint}${enterpriseId}`,
    data,
  );
};

export const adHocStockOut = ({ enterpriseId, data }) => {
  return APIinstance.post(
    `${stockApis.adHocStockOut.endpoint}${enterpriseId}`,
    data,
  );
};
