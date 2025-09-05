import { APIinstance } from '@/services';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';

export const stockIn = ({ enterpriseId, orderId }) => {
  const url = stockInOutAPIs.stockIn.endpoint
    .replace(':enterpriseId', enterpriseId)
    .replace(':orderId', orderId);

  return APIinstance.post(url);
};

export const stockOut = ({ enterpriseId, orderId }) => {
  const url = stockInOutAPIs.stockOut.endpoint
    .replace(':enterpriseId', enterpriseId)
    .replace(':orderId', orderId);

  return APIinstance.post(url);
};

export const getUnits = () => {
  return APIinstance.get(stockInOutAPIs.getUnits.endpoint);
};
