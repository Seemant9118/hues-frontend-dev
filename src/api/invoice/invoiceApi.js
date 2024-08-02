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
};
