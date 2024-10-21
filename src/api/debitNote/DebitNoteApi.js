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

  // comments
  createComments: {
    endpoint: `/order/debitnote/comment`,
    endpointKey: 'create_comments',
  },
  getComments: {
    endpoint: `/order/debitnote/getcomments/`,
    endpointKey: 'get_comments',
  },

  // upload media in comments
  uploadMediaInComments: {
    endpoint: `/order/debitnote/upload`,
    endpointKey: 'upload_media_comments',
  },
};
