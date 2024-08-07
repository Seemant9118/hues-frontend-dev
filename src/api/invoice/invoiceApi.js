export const invoiceApi = {
  // 1. create invoice
  createInvoiceNew: {
    endpoint: `/order/invoice/create`,
    endpointKey: 'create_Invoice',
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
};
