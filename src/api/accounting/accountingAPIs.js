export const accountingAPIs = {
  getJournalEntries: {
    endpoint: `/finance/journal-entries`,
    endpointKey: 'get_journal_enteries',
  },
  getJournalEntry: {
    endpoint: `/finance/journal-entries/{id}/lines`,
    endpointKey: 'get_journal_entry',
  },
};
