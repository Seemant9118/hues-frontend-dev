import { accountingAPIs } from '@/api/accounting/accountingAPIs';
import { APIinstance } from '@/services';

export const getJournalEntries = ({ page, limit }) => {
  return APIinstance.get(
    `${accountingAPIs.getJournalEntries.endpoint}?page=${page}&limit=${limit}`,
  );
};

export const getJournalEntry = ({ id }) => {
  return APIinstance.get(
    accountingAPIs.getJournalEntry.endpoint.replace('{id}', id),
  );
};

export const getCashFlow = ({ page, limit, enterpriseId, category }) => {
  return APIinstance.get(
    `${accountingAPIs.getCashFlow.endpoint}${enterpriseId}?page=${page}&limit=${limit}&category=${category}`,
  );
};
