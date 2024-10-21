import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
import { APIinstance } from '@/services';

// 1. get all credit notes
export const getAllCreditNotes = ({ id, data }) => {
  return APIinstance.post(
    `${CreditNoteApi.getAllCreditNotes.endpoint}${id}`,
    data,
  );
};
