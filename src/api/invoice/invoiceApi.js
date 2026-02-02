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
    endpoint: `/order/invoice/`,
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
  withDrawOrder: {
    endpoint: `/order/invoice/withdraw`,
    endpointKey: 'withdraw_order',
  },
  // 7. getAllSalesInvoices : enterpriseLevel
  getAllSalesInvoices: {
    endpoint: `/order/invoice/getallsalesinvoicelist/`,
    endpointKey: 'get_all_sales_invoices',
  },
  // 8. getAllPurchaseInvoices : enterpriseLevel
  getAllPurchaseInvoices: {
    endpoint: `/order/invoice/getallpurchaseinvoicelist/`,
    endpointKey: 'get_all_purchase_invoices',
  },
  // 9. export invoice
  exportSelectedInvoice: {
    endpoint: `/order/invoice/export`,
    endpointKey: 'export_invoice',
  },
  // 10. export all invoices
  exportAllInvoices: {
    endpoint: `/order/invoice/export-all`,
    endpointKey: 'export_all_invoices',
  },
  // 11. preview direct invoice
  previewDirectInvoice: {
    endpoint: `/order/invoice/preview-invoice`,
    endpointKey: 'preview_direct_invoice',
  },
  // 12. preview direct purchase invocie
  previewDirectPurchaseInvoice: {
    endpoint: `/order/invoice/purchase/preview-invoice`,
    endpointKey: 'preview_direct_purchse_invoice',
  },
  // 12. accept order
  acceptOrder: {
    endpoint: `/order/accept`,
    endpointKey: 'accept_order',
  },
  // 13.  getItemsToCreateDebitNote
  getItemsToCreateDebitNote: {
    endpoint: `/order/invoice/defective-items/`,
    endpointKey: 'get_items_to_create_debit_note',
  },
};
