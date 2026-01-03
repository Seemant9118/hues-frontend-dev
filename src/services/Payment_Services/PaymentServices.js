import { paymentApi } from '@/api/payments/payment_api';
import { APIinstance } from '@/services';

// 1.create payment
export const createPayment = (data) => {
  return APIinstance.post(paymentApi.createPayment.endpoint, data);
};

export const getPaymentsFromOrder = (id) => {
  return APIinstance.get(`${paymentApi.getPaymentsFromOrder.endpoint}${id}`);
};

// 2.get payments list
export const getPaymentsList = ({ page, limit, context, status }) => {
  return APIinstance.get(
    `${paymentApi.getPaymentsList.endpoint}?page=${page}&limit=${limit}&context=${context}&status=${status}`,
  );
};

// 3.get invoices for payments
export const getInvoicesForPayments = (id, invoiceId) => {
  if (invoiceId) {
    return APIinstance.get(
      `${paymentApi.getInvoicesForPayments.endpoint}${id}?invoiceId=${invoiceId}`,
    );
  } else {
    return APIinstance.get(
      `${paymentApi.getInvoicesForPayments.endpoint}${id}`,
    );
  }
};

// 4. get payments for invoiceId
export const getPaymentsByInvoiceId = (id) => {
  return APIinstance.get(`${paymentApi.getPaymentsByInvoiceId.endpoint}${id}`);
};

// 4. upload payment proofs
export const uploadPaymentProofs = (id, file) => {
  return APIinstance.post(
    `${paymentApi.uploadPaymentProof.endpoint}?enterpriseId=${id}`,
    file,
  );
};

export const getPaymentsDetails = (id) => {
  return APIinstance.get(`${paymentApi.getPaymentDetails.endpoint}${id}`);
};

export const acknowledgePayment = (id) => {
  return APIinstance.post(`${paymentApi.acknowledgePayment.endpoint}${id}`);
};

export const rejectPayment = (id) => {
  return APIinstance.post(`${paymentApi.rejectPayment.endpoint}${id}`);
};
