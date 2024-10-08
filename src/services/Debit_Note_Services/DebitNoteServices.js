import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { APIinstance } from '@/services';

// 1. get all debit notes
export const getAllDebitNotes = ({ id, data }) => {
  return APIinstance.post(
    `${DebitNoteApi.getAllDebitNotes.endpoint}${id}`,
    data,
  );
};

// 2. accept debit & create credit notes
export const acceptDebitCreateCreditNote = ({ id, data }) => {
  return APIinstance.put(
    `${DebitNoteApi.acceptDebitAndCreateCreditNote.endpoint}${id}`,
    data,
  );
};

// 3. reject debit note
export const rejectDebitNote = ({ id, data }) => {
  return APIinstance.put(`${DebitNoteApi.rejectDebitNote.endpoint}${id}`, data);
};

// 4. get Debit note
export const getDebitNote = (id) => {
  return APIinstance.get(`${DebitNoteApi.getDebitNote.endpoint}${id}`);
};

export const createComments = (data) => {
  return APIinstance.post(DebitNoteApi.createComments.endpoint, data);
};

export const getComments = (id) => {
  return APIinstance.get(`${DebitNoteApi.getComments.endpoint}${id}`);
};

export const uploadMediaInComments = (data) => {
  return APIinstance.post(DebitNoteApi.uploadMediaInComments.endpoint, data);
};
