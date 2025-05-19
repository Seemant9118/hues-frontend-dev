import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { APIinstance } from '@/services';

export const addBankAccount = (data) => {
  return APIinstance.post(bankAccountApis.addBankAccount.endpoint, data);
};

export const getBankAccounts = () => {
  return APIinstance.get(bankAccountApis.getBankAccounts.endpoint);
};

export const getBankAccount = (id) => {
  return APIinstance.get(
    `${bankAccountApis.getBackAccountById.endpoint}/${id}`,
  );
};

export const getRemainingAttempts = () => {
  return APIinstance.get(bankAccountApis.getRemainingAttempts.endpoint);
};
