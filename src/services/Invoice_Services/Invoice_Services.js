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

export const createInvoiceForNewOrder = (data) => {
  return APIinstance.post(invoiceApi.createInvoiceForNewOrder.endpoint, data);
};

export const getAllInvoices = ({ id, data }) => {
  return APIinstance.post(`${invoiceApi.getAllInvoices.endpoint}${id}`, data);
};
