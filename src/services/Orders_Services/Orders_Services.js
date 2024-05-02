import { order_api } from "@/api/order_api/order_api";
import { APIinstance } from "@/services";


export const CreateOrderService = (data) => {
  return APIinstance.post(order_api.createOrder.endpoint, data);
};

export const GetSales = (id) => {
  return APIinstance.get(order_api.getSales.endpoint + `${id}`);
};

export const GetPurchases = (id) => {
  return APIinstance.get(order_api.getPurchases.endpoint + `${id}`);
};

export const OrderDetails = (id) => {
  return APIinstance.get(order_api.getOrderDetails.endpoint + `${id}`);
};

export const DeleteOrder = (id) => {
  return APIinstance.delete(order_api.deleteOrder.endpoint + `${id}`);
};

export const CreateNegotiation = (data) => {
  return APIinstance.post(order_api.createNegotiation.endpoint, data);
};

export const GetNegotiationDetails = (orderId, itemId) => {
  return APIinstance.get(
    order_api.getNegotiationDetails.endpoint +
      `?order_id=${orderId}&item_id=${itemId}`
  );
};
