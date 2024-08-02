import { APIinstance } from '@/services';
import { invoiceApi } from '@/api/invoice/invoiceApi';

export const createInvoiceNew = (data) => {
  return APIinstance.post(invoiceApi.createInvoiceNew.endpoint, data);
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
