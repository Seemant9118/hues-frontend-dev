import { DebitNoteApi } from '@/api/debitNote/DebitNoteApi';
import { APIinstance } from '@/services';

// 1. get all debit notes
export const getAllSalesDebitNotes = ({ id, context, data }) => {
  return APIinstance.post(
    `${DebitNoteApi.getAllSalesDebitNotes.endpoint}${id}?context=${context}`,
    data,
  );
};
export const getAllPurchaseDebitNotes = ({ id, data }) => {
  return APIinstance.post(
    `${DebitNoteApi.getAllPurchaseDebitNotes.endpoint}${id}`,
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

export const raisedDebitNote = (data) => {
  return APIinstance.post(`${DebitNoteApi.raisedDebitNote.endpoint}`, data);
};

export const getDebitNoteByInvoice = (id) => {
  return APIinstance.get(
    `${DebitNoteApi.getDebitNoteByInvoiceId.endpoint}${id}`,
  );
};

export const updateDebitNote = ({ id, data }) => {
  return APIinstance.put(`${DebitNoteApi.updateDebitNote.endpoint}${id}`, data);
};

export const sellerResponseDebitNote = ({ id, data }) => {
  return APIinstance.post(
    `${DebitNoteApi.sellerRespondDebitNote.endpoint}${id}`,
    data,
  );
};

export const sellerResponseUpdate = ({ id, data }) => {
  return APIinstance.put(
    `${DebitNoteApi.sellerResponseUpdate.endpoint}${id}`,
    data,
  );
};

export const previewDebitNote = ({ id, data }) => {
  return APIinstance.post(
    `${DebitNoteApi.previewDebitNote.endpoint}${id}`,
    data,
  );
};

export const createComments = (data) => {
  return APIinstance.post(DebitNoteApi.createComments.endpoint, data);
};

export const getComments = (id, type) => {
  return APIinstance.get(
    `${DebitNoteApi.getComments.endpoint}?contextId=${id}&contextType=${type}`,
  );
};

export const updateComments = (data) => {
  return APIinstance.put(DebitNoteApi.updateComments.endpoint, data);
};

export const uploadMediaInComments = (data) => {
  return APIinstance.post(DebitNoteApi.uploadMediaInComments.endpoint, data);
};
