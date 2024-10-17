import { paymentApi } from '@/api/payments/payment_api';
import { APIinstance } from '@/services';

// 1.create payment
export const createPayment = (data) => {
  return APIinstance.post(paymentApi.createPayment.endpoint, data);
};

// 2.get payments list
export const getPaymentsList = (id) => {
  return APIinstance.get(`${paymentApi.getPaymentsList.endpoint}${id}`);
};

// 3.get invoices for payments
export const getInvoicesForPayments = (id) => {
  return APIinstance.get(`${paymentApi.getInvoicesForPayments.endpoint}${id}`);
};

// 4. upload payment proofs
export const uploadPaymentProofs = (id, file) => {
  return APIinstance.post(
    `${paymentApi.uploadPaymentProof.endpoint}?enterpriseId=${id}`,
    file,
  );
};
