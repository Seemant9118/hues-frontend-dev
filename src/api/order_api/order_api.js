export const orderApi = {
  // 1. Create Order
  createOrder: {
    endpoint: `/order/create`,
    endpointKey: 'order_create',
  },
  //   2. Get Sales
  getSales: {
    endpoint: `/order/getsales/`,
    endpointKey: 'get_sales',
  },
  //   3. Get Purchases
  getPurchases: {
    endpoint: `/order/getpurchases/`,
    endpointKey: 'get_purchases',
  },
  //   4. Get Order Details
  getOrderDetails: {
    endpoint: `/order/getordersdetails/`,
    endpointKey: 'get_order_details',
  },
  //   5 . Delete Order
  deleteOrder: {
    endpoint: `/order/delete/`,
    endpointKey: 'delete_order',
  },

  //   6. create Negotiation
  createNegotiation: {
    endpoint: `/order/negotiation/create`,
    endpointKey: 'create_negotitation',
  },

  //   7 . get Negotiation details
  getNegotiationDetails: {
    endpoint: `/order/negotiation/negotiationdetails`,
    endpointKey: 'get_negotiation_details',
  },

  // 8. accept/reject negotiation
  acceptRejectNegotiation: {
    endpoint: `/order/negotiation/updatestatus`,
    endpointKey: 'get_accept_reject_negotiation',
  },

  // 9. get Sales Invoice
  getSalesInvoice: {
    endpoint: `/order/salesinvoices/`,
    endpointKey: 'get_sales_invoice',
  },

  // 10. get Purchase Invoice
  getPurchaseInvoice: {
    endpoint: `/order/purchaseinvoices/`,
    endpointKey: 'get_purchase_invoice',
  },

  // 11. create Invoice : for uninvited client
  createInvoiceForUninvited: {
    endpoint: `/order/createinvoice`,
    endpointKey: 'create_invoice',
  },

  // 12. generate Invoice
  generateInvoice: {
    endpoint: `/order/generateinvoice/`,
    endpointKey: 'generate_invoice',
  },

  // 13. bulkNegotiate accept/reject
  bulkNegotiateAcceptOrReject: {
    endpoint: `/order/negotiation/bulk/updatestatus`,
    endpointKey: 'bulk_Negotiation_accept_reject',
  },

  // 14. createbulkNegotiation
  createBulkNegotiation: {
    endpoint: `/order/negotiation/bulk/create`,
    endpointKey: 'create_bulk_negotiation',
  },

  // 15. updateOrder
  updateOrder: {
    endpoint: `/order/update/`,
    endpointKey: 'update_order',
  },

  // 16. export order
  exportOrder: {
    endpoint: `/order/export`,
    endpointKey: 'export_order',
  },
};
