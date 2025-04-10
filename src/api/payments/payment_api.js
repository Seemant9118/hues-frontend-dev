export const paymentApi = {
  // 1. create payment
  createPayment: {
    endpoint: `/payment/create`,
    endpointKey: 'create_payment',
  },
  getPaymentsFromOrder: {
    endpoint: `/payment/getpayments/`,
    endpointKey: 'get_payments_from_order',
  },
  //   2. get all payments list
  getPaymentsList: {
    endpoint: `/payment/get`,
    endpointKey: 'get_payments',
  },
  getPaymentDetails: {
    endpoint: `/payment/get/`,
    endpointKey: 'get_payment_details',
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

  // acknowledge payment
  acknowledgePayment: {
    endpoint: `/payment/approve/`,
    endpointKey: 'ack_payment',
  },
  // reject payment
  rejectPayment: {
    endpoint: `/payment/reject/`,
    endpointKey: 'reject_payment',
  },
};
