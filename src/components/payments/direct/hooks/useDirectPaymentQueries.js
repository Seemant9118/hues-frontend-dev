import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { SessionStorageService } from '@/lib/utils';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import {
  getAllPurchaseInvoices,
  getAllSalesInvoices,
  getInvoice,
} from '@/services/Invoice_Services/Invoice_Services';

function saveDraftToSession({ isPurchasePage, data }) {
  const key = isPurchasePage
    ? 'orderPaymentAdviceDraft'
    : 'orderPaymentRecordDraft';
  SessionStorageService.set(key, data);
}

export function useDirectPaymentQueries({
  enterpriseId,
  isPurchasePage,
  paymentData,
  setPaymentData,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [invoices, setInvoices] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch bank accounts
  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
  });

  // Sales invoices
  const { data: salesInvoicesForPayments } = useQuery({
    queryKey: [invoiceApi.getAllSalesInvoices.endpointKey, debouncedSearch],
    queryFn: async () => {
      const response = await getAllSalesInvoices({
        id: enterpriseId,
        data: {
          searchString: debouncedSearch,
          page: 1,
          limit: 10,
        },
      });
      return response;
    },
    enabled: !!debouncedSearch && !isPurchasePage,
    select: (res) => res.data.data,
  });

  // Purchase invoices
  const { data: purchaseInvoicesForPayments } = useQuery({
    queryKey: [invoiceApi.getAllPurchaseInvoices.endpointKey, debouncedSearch],
    queryFn: async () => {
      const response = await getAllPurchaseInvoices({
        id: enterpriseId,
        data: {
          searchString: debouncedSearch,
          page: 1,
          limit: 10,
        },
      });
      return response;
    },
    enabled: !!debouncedSearch && isPurchasePage,
    select: (res) => res.data.data,
  });

  const invoicesForPayments = isPurchasePage
    ? purchaseInvoicesForPayments
    : salesInvoicesForPayments;

  useEffect(() => {
    if (invoicesForPayments) {
      const updatedInvoices = invoicesForPayments?.data?.map((invoice) => ({
        ...invoice,
        invoiceId: Number(invoice.invoiceId),
        amount: 0,
      }));
      setInvoices(updatedInvoices);
    }
  }, [invoicesForPayments]);

  // Fetch single invoice details
  const { data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, paymentData?.invoiceId],
    queryFn: () => getInvoice(paymentData?.invoiceId),
    select: (data) => data.data.data,
    enabled: !!paymentData?.invoiceId,
  });

  useEffect(() => {
    if (!invoiceDetails) return;

    const invoiceData = invoiceDetails?.invoiceDetails;

    const updatedPaymentData = {
      ...paymentData,
      balance: (invoiceData?.totalAmount || 0) - (invoiceData?.amountPaid || 0),
      orderId: invoiceData?.orderId,
      invoices: [
        {
          invoiceId: Number(paymentData.invoiceId),
          amount: Number(paymentData.amount) || 0,
        },
      ],
    };

    setPaymentData(updatedPaymentData);

    saveDraftToSession({
      isPurchasePage,
      data: updatedPaymentData,
    });
  }, [invoiceDetails]);

  return {
    searchTerm,
    setSearchTerm,
    invoices,
    bankAccounts,
  };
}
