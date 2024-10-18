export const paymentApi = {
  // 1. create payment
  createPayment: {
    endpoint: `/payment/create`,
    endpointKey: 'create_payment',
  },
  //   2. get all payments list
  getPaymentsList: {
    endpoint: `/payment/getpayments/`,
    endpointKey: 'get_payments',
  },
  //   3. get invoices for payment
  getInvoicesForPayments: {
    endpoint: `/invoice-receivable/getpendinginvoices/`,
    endpointKey: 'get_Invoices_payments',
  },
  // 4. getPaymentsByInvoiceId
  getPaymentsByInvoiceId: {
    endpoint: `/payment/getpaymentsbyinvoice/`,
    endpointKey: 'get_payments_by_invoiceId',
  },

  uploadPaymentProof: {
    endpoint: `/payment/upload`,
    endpointKey: 'upload_payment_proofs',
  },
};
