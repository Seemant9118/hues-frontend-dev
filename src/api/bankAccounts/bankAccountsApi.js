export const bankAccountApis = {
  addBankAccount: {
    endpoint: `/enterprise/bank-account/save`,
    endpointKey: 'add_bank_account',
  },
  getBankAccounts: {
    endpoint: `/enterprise/bank-account/get`,
    endpointKey: 'get_bank_accounts',
  },
  getBackAccountById: {
    endpoint: `/enterprise/bank-account/get/`,
    endpointKey: 'get_bank_account',
  },
  getRemainingAttempts: {
    endpoint: `/enterprise/bank-account/attempts-remaining`,
    endpointKey: 'get_remaining_attempts',
  },
};
