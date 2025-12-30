export const DebitNoteApi = {
  getAllSalesDebitNotes: {
    endpoint: `/order/debitnote/getallsalesdebitnotes/`,
    endpointKey: 'get_All_Sales_debit_notes',
  },
  getAllPurchaseDebitNotes: {
    endpoint: `/order/debitnote/getallpurchasedebitnotes/`,
    endpointKey: 'get_All_Purchase_debit_notes',
  },
  acceptDebitAndCreateCreditNote: {
    endpoint: `/order/debitnote/accept/`,
    endpointKey: 'accept_debit_note_create_credit_note',
  },
  rejectDebitNote: {
    endpoint: `/order/debitnote/reject/`,
    endpointKey: 'reject_debit_note',
  },
  getDebitNote: {
    endpoint: `/order/debitnote/`,
    endpointKey: 'get_debit_note',
  },
  raisedDebitNote: {
    endpoint: `/order/debitnote/create`,
    endpointKey: 'raised_debit_note',
  },
  getDebitNoteByInvoiceId: {
    endpoint: `/order/debitnote/getdebitnotesbyinvoiceid/`,
    endpointKey: 'get_debit_note_by_invoiceId',
  },
  updateDebitNote: {
    endpoint: `/order/debitnote/update/`,
    endpointKey: 'update_debit_note',
  },
  sellerRespondDebitNote: {
    endpoint: `/order/creditnote/draft/respond/`,
    endpointKey: 'seller_response_debit_note',
  },

  // comments
  createComments: {
    endpoint: `/comments/create`,
    endpointKey: 'create_comments',
  },
  getComments: {
    endpoint: `/comments/get`,
    endpointKey: 'get_comments',
  },
  updateComments: {
    endpoint: `/comments/update`,
    endpointKey: 'update_comments',
  },

  // upload media in comments
  uploadMediaInComments: {
    endpoint: `/order/debitnote/upload`,
    endpointKey: 'upload_media_comments',
  },
};
