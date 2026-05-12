/* eslint-disable jsx-a11y/alt-text */
import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { formattedAmount, getEnterpriseId } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import {
  getAllPurchaseInvoices,
  getAllSalesInvoices,
  getInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import { createPayment } from '@/services/Payment_Services/PaymentServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Check,
  FileText,
  Image,
  Plus,
  Search,
  Upload,
  UploadCloud,
  X,
} from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import AddBankAccount from '../settings/AddBankAccount';
import { Button } from '../ui/button';
import DatePickers from '../ui/DatePickers';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Wrapper from '../wrappers/Wrapper';

const DirectPayment = ({ setIsPaymentRecording }) => {
  const enterpriseId = getEnterpriseId();
  const translations = useTranslations('components.make_payment');

  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const contextType = isPurchasePage ? 'PAYMENT_ADVICE' : 'PAYMENT';

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [errorMsg, setErrorMsg] = useState({});
  const [files, setFiles] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [paymentData, setPaymentData] = useState({
    balance: '',
    amount: '',
    paymentMode: '',
    transactionId: '',
    invoiceId: null,
    orderId: null,
    invoices: [],
    bankAccountId: [],
    paymentDate: null,
  });

  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);

  function saveDraftToSession({ isPurchasePage, data }) {
    const key = isPurchasePage
      ? 'orderPaymentAdviceDraft'
      : 'orderPaymentRecordDraft';
    SessionStorageService.set(key, data);
  }

  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
  });

  // API with searchString (debounced)
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

  // fetch invoice details
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
          amount: Number(paymentData.amount) || 0, // important
        },
      ],
    };

    setPaymentData(updatedPaymentData);

    saveDraftToSession({
      isPurchasePage,
      data: updatedPaymentData,
    });
  }, [invoiceDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedPaymentData = { ...paymentData };

    if (name === 'amount') {
      // allow only numbers + decimal
      if (!/^\d*\.?\d*$/.test(value)) return;

      updatedPaymentData.amount = value;

      // ✅ sync amount to invoices
      updatedPaymentData.invoices = updatedPaymentData.invoices.map((inv) => ({
        ...inv,
        amount: Number(value) || 0,
      }));

      // validation
      const numericValue = parseFloat(value);

      if (value === '') {
        setErrorMsg((prev) => ({
          ...prev,
          amountPaid: translations('errorMsg.amount_paid_empty'),
        }));
      } else if (
        !Number.isNaN(numericValue) &&
        numericValue > paymentData?.balance
      ) {
        setErrorMsg((prev) => ({
          ...prev,
          amountPaid: translations('errorMsg.amount_paid_exceed'),
        }));
      } else {
        setErrorMsg((prev) => ({
          ...prev,
          amountPaid: '',
        }));
      }
    } else {
      updatedPaymentData[name] = value;
    }

    setPaymentData(updatedPaymentData);

    saveDraftToSession({
      isPurchasePage,
      data: updatedPaymentData,
    });
  };

  const handleAttached = async (file) => {
    setFiles((prev) => [...prev, file]);
    toast.success('File attached successfully!');
  };

  const handleFileRemove = (file) => {
    setFiles((prev) => prev.filter((f) => f.name !== file.name));
  };

  const validation = (updatedPaymentData) => {
    const error = {};

    if (updatedPaymentData?.invoices?.length === 0) {
      error.invoices = translations('errorMsg.invoices');
    }

    if (!updatedPaymentData?.paymentDate) {
      error.paymentDate = translations('errorMsg.payment_date');
    }

    if (
      updatedPaymentData.paymentMode !== 'cash' &&
      (!updatedPaymentData.transactionId ||
        updatedPaymentData.transactionId.trim() === '')
    ) {
      error.transactionId =
        translations('errorMsg.transaction_id') ||
        'Please enter a transaction ID.';
    }

    if (!updatedPaymentData.paymentMode) {
      error.paymentMode =
        translations('errorMsg.payment_mode') ||
        'Please select a payment mode.';
    }

    if (!updatedPaymentData.amount || Number(updatedPaymentData.amount) <= 0) {
      error.amountPaid =
        translations('errorMsg.amount_paid_required') ||
        'Amount must be greater than 0.';
    }

    return error;
  };

  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: (res) => {
      toast.success(translations('successMsg.payment_recorded_sucessfully'));
      if (!isPurchasePage) {
        router.push(`/dashboard/sales/sales-payments/${res.data.data.id}`);
      } else {
        router.push(
          `/dashboard/purchases/purchase-payments/${res.data.data.id}`,
        );
      }
    },
  });

  const handleSubmit = () => {
    const updatedPaymentData = {
      ...paymentData,
      invoices: paymentData.invoices.map((inv) => ({
        invoiceId: inv.invoiceId,
        amount: Number(paymentData.amount) || 0,
      })),
    };

    const errors = validation(updatedPaymentData);

    if (Object.keys(errors).length > 0) {
      setErrorMsg(errors);
      return;
    }

    const formData = new FormData();

    formData.append('orderId', updatedPaymentData.orderId);
    formData.append('paymentMode', updatedPaymentData.paymentMode);
    formData.append('transactionId', updatedPaymentData.transactionId);
    formData.append('context', contextType);
    formData.append('invoices', JSON.stringify(updatedPaymentData.invoices));
    formData.append('amount', updatedPaymentData.amount);
    formData.append('bankAccountId', updatedPaymentData.bankAccountId);

    const formattedPaymentDate = moment(updatedPaymentData.paymentDate).format(
      'DD/MM/YYYY',
    );

    formData.append('paymentDate', formattedPaymentDate);

    createPaymentMutationFn.mutate(formData);
  };

  return (
    <Wrapper className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50/40">
      {isBankAccountAdding && (
        <AddBankAccount
          isModalOpen={isBankAccountAdding}
          setIsModalOpen={setIsBankAccountAdding}
        />
      )}
      <div className="scrollBarStyles flex-1 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {/* inputs */}
          <section className="flex flex-col gap-4 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {/* Select Invoices */}
              {/* SEARCHABLE INVOICE SELECT */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  <span className="text-red-600">*</span>
                  {translations('form.label.invoice_id')}
                </Label>

                <Select
                  value={paymentData.invoiceId || ''}
                  onValueChange={(value) => {
                    setPaymentData((prev) => ({
                      ...prev,
                      invoiceId: value,
                    }));
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Search invoice..." />
                  </SelectTrigger>

                  <SelectContent>
                    {/* 🔍 Search Input */}
                    <div className="flex items-center gap-2 px-2 pb-2">
                      <Search size={14} />
                      <Input
                        placeholder="Search invoice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    {invoices?.map((invoice) => (
                      <SelectItem
                        key={invoice.invoiceId}
                        value={String(invoice.invoiceId)}
                      >
                        {invoice.invoicereferencenumber ||
                          invoice.invoiceReferenceNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* select payment mode */}
              <div className="space-y-2">
                <Label className="flex-shrink-0 text-sm font-semibold">
                  {translations('form.label.payment_mode')}{' '}
                  <span className="text-red-600">*</span>
                </Label>{' '}
                <Select
                  value={paymentData.paymentMode}
                  onValueChange={(value) => {
                    // Check if a payment mode is selected (non-empty value)
                    if (value) {
                      setErrorMsg((prevMsg) => ({
                        ...prevMsg,
                        paymentMode: '', // Clear the payment mode error message
                      }));
                    }

                    const updatedPaymentData = {
                      ...paymentData,
                      paymentMode: value,
                    };
                    setPaymentData(updatedPaymentData);

                    saveDraftToSession({
                      isPurchasePage,
                      data: updatedPaymentData,
                    });
                  }}
                >
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="neft">
                      {translations('form.label.options.neft')}
                    </SelectItem>
                    <SelectItem value="rtgs">
                      {translations('form.label.options.rtgs')}
                    </SelectItem>
                    <SelectItem value="upi">
                      {translations('form.label.options.upi')}
                    </SelectItem>
                    <SelectItem value="creditDebitCard">
                      {translations('form.label.options.credit_debit')}
                    </SelectItem>
                    <SelectItem value="cheque">
                      {translations('form.label.options.cheque')}
                    </SelectItem>
                    <SelectItem value="cash">
                      {translations('form.label.options.cash')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errorMsg.paymentMode && (
                  <ErrorBox msg={errorMsg.paymentMode} />
                )}
              </div>
              {/* select payment Date */}
              <div className="space-y-2">
                <Label className="flex-shrink-0 text-sm font-semibold">
                  {translations('form.label.payment_date')}{' '}
                  <span className="text-red-600">*</span>
                </Label>{' '}
                <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <DatePickers
                    selected={paymentData.paymentDate}
                    onChange={(date) => {
                      const updatedPaymentData = {
                        ...paymentData,
                        paymentDate: date,
                      };
                      setPaymentData(updatedPaymentData);

                      saveDraftToSession({
                        isPurchasePage,
                        data: updatedPaymentData,
                      });

                      setErrorMsg((prevMsg) => ({
                        ...prevMsg,
                        paymentDate: '', // Clear any previous error for payment date
                      }));
                    }}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="top-right"
                  />
                  <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
                </div>
                {errorMsg.paymentDate && (
                  <ErrorBox msg={errorMsg.paymentDate} />
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Bank Account Details */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.bank_acc_details')}
                </Label>
                <div>
                  <Select
                    value={paymentData?.bankAccountId || ''}
                    onValueChange={(value) => {
                      // Check if a payment mode is selected (non-empty value)
                      if (value) {
                        setErrorMsg((prevMsg) => ({
                          ...prevMsg,
                          bankAccountId: [],
                        }));
                      }

                      const updatedPaymentData = {
                        ...paymentData,
                        bankAccountId: value,
                      };
                      setPaymentData(updatedPaymentData);

                      saveDraftToSession({
                        isPurchasePage,
                        data: updatedPaymentData,
                      });
                    }}
                  >
                    <SelectTrigger
                      className="w-full bg-white"
                      disabled={paymentData.paymentMode === 'cash'}
                    >
                      <SelectValue placeholder="Select Bank Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {bankAccounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {`Acc ${account.maskedAccountNumber}`}
                        </SelectItem>
                      ))}
                      <div
                        onClick={(e) => {
                          e.stopPropagation(); // prevent closing the dropdown immediately
                          setIsBankAccountAdding(true);
                        }}
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold"
                      >
                        <Plus size={14} />
                        Add New Bank Account
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* transaction ID */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.tran_id')}{' '}
                  {paymentData?.paymentMode !== 'cash' && (
                    <span className="text-red-600">*</span>
                  )}
                </Label>
                <div>
                  <Input
                    name="transactionId"
                    value={paymentData.transactionId}
                    disabled={
                      !paymentData.paymentMode ||
                      paymentData.paymentMode === 'cash'
                    }
                    onChange={handleInputChange}
                  />
                </div>
                {errorMsg.transactionId && (
                  <ErrorBox msg={errorMsg.transactionId} />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Amount */}
              <div className="space-y-2">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('form.label.amount_paid')}
                  </Label>
                  <span className="text-red-600">*</span>
                </div>
                <div>
                  <Input
                    name="amount"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                {errorMsg.amountPaid && <ErrorBox msg={errorMsg.amountPaid} />}
              </div>

              {/* Balance */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.balance')}
                </Label>
                <div>
                  <Input
                    disabled
                    value={formattedAmount(paymentData?.balance || 0)}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* uploads payments proofs */}
          <section className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:p-5">
            <Label className="text-sm font-semibold">
              {translations('form.upload_proof.title')}
            </Label>
            <div className="flex flex-wrap gap-4">
              {files?.map((file) => (
                <div
                  key={file.name}
                  className="relative flex w-full flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm sm:w-64"
                >
                  {/* Remove Button */}
                  <X
                    size={16}
                    onClick={() => handleFileRemove(file)}
                    className="absolute right-2 top-2 cursor-pointer text-neutral-500 hover:text-red-500"
                  />

                  {/* File icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                    {file.name.split('.').pop() === 'pdf' ? (
                      <FileText size={16} className="text-red-600" />
                    ) : (
                      <Image size={16} className="text-primary" />
                    )}
                  </div>

                  {/* File name */}
                  <p className="truncate text-sm font-medium text-neutral-800">
                    {file.name}
                  </p>

                  {/* Success message */}
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-green-500/10 p-1.5 text-green-600">
                      <Check size={12} />
                    </div>
                    <p className="text-xs font-medium text-green-600">
                      {translations('successMsg.attached_success')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <FileUploader
              handleChange={handleAttached}
              name="file"
              types={['png', 'pdf']}
            >
              <div className="mb-2 flex w-full cursor-pointer flex-col items-start justify-between gap-4 rounded-xl border-2 border-dashed border-[#288AF9] px-4 py-6 sm:px-5 md:flex-row md:items-center md:py-10">
                <div className="flex items-start gap-4 md:items-center">
                  <UploadCloud className="text-[#288AF9]" size={40} />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium text-darkText">
                      {translations('form.upload_proof.para')}
                    </p>
                    <p className="text-xs font-normal text-[#288AF9]">
                      {translations('form.upload_proof.note')}
                    </p>
                  </div>
                </div>
                <Button variant="blue_outline" className="w-full md:w-auto">
                  <Upload />
                  {translations('form.upload_proof.ctas.select')}
                </Button>
              </div>
            </FileUploader>
          </section>
        </div>
      </div>

      <div className="sticky bottom-0 z-20 flex w-full flex-col-reverse gap-2 border-t-2 bg-white/95 p-3 backdrop-blur sm:flex-row sm:justify-end sm:p-4">
        <Button
          variant="outline"
          className="w-full sm:w-32"
          size="sm"
          onClick={() => {
            // state clear
            setIsPaymentRecording(false);
            setInvoices([]);
            setErrorMsg({});
            setPaymentData({
              amount: '',
              paymentMode: '',
              transactionId: '',
              invoices: [],
              bankAccountId: [],
            });
          }}
        >
          {translations('form.ctas.discard')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createPaymentMutationFn.isPending}
          size="sm"
          className="w-full bg-[#288AF9] text-white hover:bg-primary hover:text-white sm:w-32"
        >
          {createPaymentMutationFn.isPending ? (
            <Loading />
          ) : (
            translations('form.ctas.create')
          )}
        </Button>
      </div>
    </Wrapper>
  );
};

export default DirectPayment;
