export const ticketAPIs = {
  getTickets: {
    endpoint: `/ticket`,
    endpointKey: 'get_tickets',
  },
  updateTicketsStatus: {
    endpoint: `/ticket/:ticketId/status`,
    endpointKey: 'update_tickets_status',
  },
  createManualTicket: {
    endpoint: `/ticket/manual`,
    endpointKey: 'create_manual_ticket',
  },
};
