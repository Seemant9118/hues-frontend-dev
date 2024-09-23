import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { APIinstance } from '@/services';

// 1. get all debit notes
export const getAllDebitNotes = (id) => {
  return APIinstance.get(`${DebitNoteApi.getAllDebitNotes.endpoint}${id}`);
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
