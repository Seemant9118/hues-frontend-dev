export const accountingAPIs = {
  getJournalEntries: {
    endpoint: `/finance/journal-entries`,
    endpointKey: 'get_journal_enteries',
  },
  getJournalEntry: {
    endpoint: `/finance/journal-entries/{id}/lines`,
    endpointKey: 'get_journal_entry',
  },
  getCashFlow: {
    endpoint: `/cash-flow/entries/`,
    endpointKey: 'get_cash_flow_actual',
  },
  manualEnteriesCreated: {
    endpoint: `/trial-balance/manual-journal-entries`,
    endpointKey: 'manual_entries_created',
  },
  ledgerSubledgers: {
    endpoint: `/trial-balance/ledger-subledgers`,
    endpointKey: 'ledger_subledgers',
  },
};
