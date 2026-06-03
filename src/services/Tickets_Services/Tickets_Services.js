import { ticketAPIs } from '@/api/tickets/ticket_api';
import { APIinstance } from '..';

export const getTickets = (data) => {
  return APIinstance.post(`${ticketAPIs.getTickets.endpoint}`, data);
};

export const updateTicketStatus = ({ ticketId, status }) => {
  return APIinstance.patch(
    `${ticketAPIs.updateTicketsStatus.endpoint.replace(':ticketId', ticketId)}`,
    status,
  );
};

export const createManualTicket = (data) => {
  return APIinstance.post(`${ticketAPIs.createManualTicket.endpoint}`, data);
};
