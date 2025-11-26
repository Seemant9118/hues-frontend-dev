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
};
