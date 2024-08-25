import { orderApi } from '@/api/order_api/order_api';
import { APIinstance } from '@/services';

export const CreateOrderService = (data) => {
  return APIinstance.post(orderApi.createOrder.endpoint, data);
};

export const GetSales = (id) => {
  return APIinstance.get(`${orderApi.getSales.endpoint}${id}`);
};

export const GetPurchases = (id) => {
  return APIinstance.get(`${orderApi.getPurchases.endpoint}${id}`);
};

export const OrderDetails = (id) => {
  return APIinstance.get(`${orderApi.getOrderDetails.endpoint}${id}`);
};

export const DeleteOrder = (id) => {
  return APIinstance.delete(`${orderApi.deleteOrder.endpoint}${id}`);
};

export const CreateNegotiation = (data) => {
  return APIinstance.post(orderApi.createNegotiation.endpoint, data);
};

export const GetNegotiationDetails = ({ orderId, itemId }) => {
  return APIinstance.get(
    `${orderApi.getNegotiationDetails.endpoint}?order_id=${orderId}&item_id=${itemId}`,
  );
};

export const AccpetRejectNegotiation = (data) => {
  return APIinstance.post(orderApi.acceptRejectNegotiation.endpoint, data);
};

export const getSalesInvoices = (id) => {
  return APIinstance.get(`${orderApi.getSalesInvoice.endpoint}${id}`);
};

export const getPurchaseInvoices = (id) => {
  return APIinstance.get(`${orderApi.getPurchaseInvoice.endpoint}${id}`);
};

export const createInvoice = (data) => {
  return APIinstance.post(orderApi.createInvoice.endpoint, data);
};

export const generateInvoice = (id) => {
  return APIinstance.post(`${orderApi.generateInvoice.endpoint}${id}`);
};

export const bulkNegotiateAcceptOrReject = (data) => {
  return APIinstance.post(orderApi.bulkNegotiateAcceptOrReject.endpoint, data);
};

export const createBulkNegotiaion = (data) => {
  return APIinstance.post(orderApi.createBulkNegotiation.endpoint, data);
};

export const updateOrder = (id, data) => {
  return APIinstance.post(`${orderApi.updateOrder.endpoint}${id}`, data);
};
