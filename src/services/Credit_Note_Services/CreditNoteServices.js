import { CreditNoteApi } from '@/api/creditNote/CreditNoteApi';
import { APIinstance } from '@/services';

// 1. get all credit notes
export const getAllCreditNotes = (id) => {
  return APIinstance.get(`${CreditNoteApi.getAllCreditNotes.endpoint}${id}`);
};
