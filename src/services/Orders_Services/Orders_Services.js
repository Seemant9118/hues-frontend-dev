import { orderApi } from '@/api/order_api/order_api';
import { APIinstance } from '@/services';
import { toast } from 'sonner';

export const CreateOrderService = (data) => {
  return APIinstance.post(orderApi.createOrder.endpoint, data);
};

export const GetSales = ({ id, data }) => {
  return APIinstance.post(`${orderApi.getSales.endpoint}${id}`, data);
};

export const GetPurchases = ({ id, data }) => {
  return APIinstance.post(`${orderApi.getPurchases.endpoint}${id}`, data);
};

export const OrderDetails = (id) => {
  return APIinstance.get(`${orderApi.getOrderDetails.endpoint}${id}`);
};

export const DeleteOrder = ({ id }) => {
  return APIinstance.delete(`${orderApi.deleteOrder.endpoint}${id}`);
};

export const CreateNegotiation = (data) => {
  return APIinstance.post(orderApi.createNegotiation.endpoint, data);
};

export const GetNegotiationDetails = ({ orderId, itemId }) => {
  if (itemId) {
    return APIinstance.get(
      `${orderApi.getNegotiationDetails.endpoint}?order_id=${orderId}&item_id=${itemId}`,
    );
  } else {
    return APIinstance.get(
      `${orderApi.getNegotiationDetails.endpoint}?order_id=${orderId}`,
    );
  }
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

export const updateOrderForUnrepliedSales = (data) => {
  return APIinstance.put(
    `${orderApi.updateOrderForUnrepliedSales.endpoint}`,
    data,
  );
};

export const exportOrder = (data) => {
  return APIinstance.post(orderApi.exportOrder.endpoint, data, {
    responseType: 'blob', // Specify response type here
  });
};

export const getUnconfirmedSales = ({ id, data }) => {
  return APIinstance.post(
    `${orderApi.getUnconfirmedSales.endpoint}${id}`,
    data,
  );
};

export const getUnconfirmedPurchases = ({ id, data }) => {
  return APIinstance.post(
    `${orderApi.getUnconfirmedPurchases.endpoint}${id}`,
    data,
  );
};

export const viewOrderinNewTab = async (id) => {
  try {
    const response = await APIinstance.post(
      `${orderApi.viewOrderinNewTab.endpoint}${id}`,
      {},
      { responseType: 'blob' },
    );

    const pdfBlob = response.data;
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const filename = `order-${id}.pdf`;

    const htmlContent = `
      <html>
        <head><title>${filename}</title></head>
        <body style="margin:0">
          <iframe src="${pdfUrl}" type="application/pdf" width="100%" height="100%" style="border:none;"></iframe>
        </body>
      </html>
    `;

    const newTab = window.open();
    if (newTab) {
      newTab.document.open();
      newTab.document.write(htmlContent);
      newTab.document.close();
    } else {
      toast.error('Popup blocked. PDF download instead.');
    }
  } catch (error) {
    toast.error('Error fetching Order PDF');
  }
};

export const remindOrder = (id) => {
  return APIinstance.post(`${orderApi.remindOrder.endpoint}${id}`);
};
