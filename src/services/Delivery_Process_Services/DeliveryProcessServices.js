import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { APIinstance } from '..';

export const createDispatchNote = ({ id, data }) => {
  return APIinstance.post(
    `${deliveryProcess.createDispatchNote.endpoint}${id}`,
    data,
  );
};

export const getDispatchNotesByInvoice = (id) => {
  return APIinstance.get(
    `${deliveryProcess.getDispatchNotesByInvoice.endpoint}${id}`,
  );
};

export const getDispatchNote = (id) => {
  return APIinstance.get(`${deliveryProcess.getDisptachNote.endpoint}${id}`);
};
