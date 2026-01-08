import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
import { APIinstance } from '@/services';

export const getAllCreditNotes = ({ context, page, limit, debitNoteId }) => {
  return APIinstance.get(
    `${CreditNoteApi.getAllCreditNotes.endpoint}?page=${page}&limit=${limit}&context=${context}&debitNoteId=${debitNoteId}`,
  );
};

export const getCreditNote = ({ id }) => {
  return APIinstance.get(`${CreditNoteApi.getCreditNote.endpoint}${id}`);
};

export const createCreditNote = ({ id, data }) => {
  return APIinstance.post(
    `${CreditNoteApi.createCreditNote.endpoint}${id}`,
    data,
  );
};

export const previewCreditNote = ({ id, data }) => {
  return APIinstance.post(
    `${CreditNoteApi.previewCreditNote.endpoint}${id}`,
    data,
  );
};
