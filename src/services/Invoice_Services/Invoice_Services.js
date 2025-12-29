import { APIinstance } from '@/services';
import { invoiceApi } from '@/api/invoice/invoiceApi';

export const createInvoiceForAcceptedOrder = (data) => {
  return APIinstance.post(
    invoiceApi.createInvoiceForAcceptedOrder.endpoint,
    data,
  );
};

export const getInvoices = (id) => {
  return APIinstance.get(`${invoiceApi.getInvoices.endpoint}${id}`);
};

export const getInvoice = (id) => {
  return APIinstance.get(`${invoiceApi.getInvoice.endpoint}${id}`);
};

export const previewInvoice = (data) => {
  return APIinstance.post(invoiceApi.previewInvoice.endpoint, data);
};

export const invoiceGenerateOTP = () => {
  return APIinstance.post(invoiceApi.generateOTPInvoice.endpoint);
};

export const withDrawOrder = (data) => {
  return APIinstance.put(invoiceApi.withDrawOrder.endpoint, data);
};

export const getAllSalesInvoices = ({ id, data }) => {
  return APIinstance.post(
    `${invoiceApi.getAllSalesInvoices.endpoint}${id}`,
    data,
  );
};

export const getAllPurchaseInvoices = ({ id, data }) => {
  return APIinstance.post(
    `${invoiceApi.getAllPurchaseInvoices.endpoint}${id}`,
    data,
  );
};

export const exportSelectedInvoice = (data) => {
  return APIinstance.post(invoiceApi.exportSelectedInvoice.endpoint, data, {
    responseType: 'blob', // Specify response type here
  });
};

export const exportAllInvoice = ({ type, body }) => {
  return APIinstance.post(
    `${invoiceApi.exportAllInvoices.endpoint}?context=${type}`,
    body,
    {
      responseType: 'blob', // Specify response type here
    },
  );
};

export const previewDirectInvoice = (data) => {
  return APIinstance.post(invoiceApi.previewDirectInvoice.endpoint, data);
};

export const acceptOrder = (data) => {
  return APIinstance.put(invoiceApi.acceptOrder.endpoint, data);
};

export const getItemsToCreateDebitNote = ({ id }) => {
  return APIinstance.get(
    `${invoiceApi.getItemsToCreateDebitNote.endpoint}${id}`,
  );
};
