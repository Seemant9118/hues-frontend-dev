import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { APIinstance } from '@/services';

export const createDispatchNote = ({ id, data }) => {
  return APIinstance.post(
    `${deliveryProcess.createDispatchNote.endpoint}${id}`,
    data,
  );
};

export const getDispatchNotes = ({ invoiceId, enterpriseId, page, limit }) => {
  const baseUrl = deliveryProcess.getDispatchNotes.endpoint;

  // If invoiceId exists → fetch by invoice
  if (invoiceId) {
    return APIinstance.get(`${baseUrl}?invoiceId=${invoiceId}`);
  }

  return APIinstance.get(
    `${baseUrl}?enterpriseId=${enterpriseId}&page=${page}&limit=${limit}`,
  );
};

export const getDispatchNote = (id) => {
  return APIinstance.get(`${deliveryProcess.getDisptachNote.endpoint}${id}`);
};
