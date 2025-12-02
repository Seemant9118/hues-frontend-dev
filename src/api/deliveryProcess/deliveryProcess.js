export const deliveryProcess = {
  createDispatchNote: {
    endpoint: `/dispatchnote/create/`,
    endpointKey: 'create_dispatch_note',
  },
  getDispatchNotes: {
    endpoint: `/dispatchnote/list/`,
    endpointKey: 'get_dispatch_notes_by_invoice',
  },
  getDispatchNote: {
    endpoint: `/dispatchnote/details/`,
    endpointKey: 'get_dispatch_note_by_id',
  },
  previewDispatchNote: {
    endpoint: `/dispatchnote/document/`,
    endpointKey: 'preview_dispatch_note',
  },
  addTransporter: {
    endpoint: `/dispatchnote/addtransporter/`,
    endpointKey: 'add_transporter_to_dispatch_note',
  },
  sendToTransporter: {
    endpoint: `/dispatchnote/sendtotransporter/`,
    endpointKey: 'send_dispatch_note_to_transporter',
  },
  addBooking: {
    endpoint: `/dispatchnote/addbooking/`,
    endpointKey: 'add_booking_to_dispatch_note',
  },
  updateStatus: {
    endpoint: `/dispatchnote/updatestatus/`,
    endpointKey: 'update_dispatch_note_status',
  },
  update: {
    endpoint: `/dispatchnote/update/`,
    endpointKey: 'update_dispatch_note_status',
  },
  generateEWB: {
    endpoint: `/dispatchnote/eway-bill/`,
    endpointKey: 'generate_ewb',
  },
  updateEWBPartB: {
    endpoint: `/dispatchnote/eway-bill/part-b`,
    endpointKey: 'update_ewb_part_b',
  },
  getEWB: {
    endpoint: `/dispatchnote/eway-bill/`,
    endpointKey: 'get_ewb',
  },
  getEWBs: {
    endpoint: `/dispatchnote/eway-bills/list-by-dispatch-note`,
    endpointKey: 'get_ewbs',
  },

  // delivery challan
  previewDeliveryChallan: {
    endpoint: `/dispatchnote/voucher/preview-document/`,
    endpointKey: 'preview_delivery_challan',
  },
  generateDeliveryChallan: {
    endpoint: `/dispatchnote/voucher/create/`,
    endpointKey: 'generate_delivery_challan',
  },
  getDeliveryChallan: {
    endpoint: `/dispatchnote/voucher/`,
    endpointKey: 'get_delivery_challan',
  },
  getDeliveryChallans: {
    endpoint: `/dispatchnote/vouchers/list`,
    endpointKey: 'get_delivery_challans',
  },
};
