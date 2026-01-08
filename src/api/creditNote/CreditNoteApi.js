export const CreditNoteApi = {
  getAllCreditNotes: {
    endpoint: `/order/creditnote/getcreditnotes`,
    endpointKey: 'get_all_credit_notes',
  },
  getCreditNote: {
    endpoint: `/order/creditnote/`,
    endpointKey: 'get_credit_note',
  },
  createCreditNote: {
    endpoint: `/order/creditnote/create/`,
    endpointKey: 'create_credit_note',
  },
  previewCreditNote: {
    endpoint: `/order/creditnote/document/`,
    endpointKey: 'preview_credit_notes',
  },
};
