export const invoiceApi = {
  // 1. create invoice : for accepted order
  createInvoiceForAcceptedOrder: {
    endpoint: `/order/invoice/create`,
    endpointKey: 'create_Invoice_accepted_order',
  },
  //   2. get invoices
  getInvoices: {
    endpoint: `/order/invoice/getinvoicelist/`,
    endpointKey: 'get_Invoices',
  },
  //   3. get Invoice by Id
  getInvoice: {
    endpoint: `/order/invoice/:invoiceId`,
    endpointKey: 'get_Invoice',
  },
  // 4. Preview Invoice
  previewInvoice: {
    endpoint: `/order/invoice/preview`,
    endpointKey: 'preview_Invoice',
  },
  // 5. generateOTP for Invoice
  generateOTPInvoice: {
    endpoint: `/order/invoice/verifysignature/generateotp`,
    endpointKey: 'invoice_generate_otp',
  },
  // 6.createInvoiceNew : for NEW Order
  createInvoiceForNewOrder: {
    endpoint: `/order/invoice/generate`,
    endpointKey: 'create_invoice_new_order',
  },
  // 7. getAllInvoices : enterpriseLevel
  getAllInvoices: {
    endpoint: `/order/invoice/getallinvoicelist/`,
    endpointKey: 'get_all_invoices',
  },
};
