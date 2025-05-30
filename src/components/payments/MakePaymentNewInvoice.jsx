import { bankAccountApis } from '@/api/bankAccounts/bankAccountsApi';
import { paymentApi } from '@/api/payments/payment_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { getBankAccounts } from '@/services/BankAccount_Services/BankAccountServices';
import {
  createPayment,
  getInvoicesForPayments,
} from '@/services/Payment_Services/PaymentServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  CalendarDays,
  Check,
  FileText,
  Image,
  Plus,
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
import InvoiceOverview from '../invoices/InvoiceOverview';
import AddBankAccount from '../settings/AddBankAccount';
import { Button } from '../ui/button';
import DatePickers from '../ui/DatePickers';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import Loading from '../ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import Wrapper from '../wrappers/Wrapper';

const MakePaymentNewInvoice = ({
  invoiceDetails,
  setIsRecordingPayment,
  paymentStatus,
  debitNoteStatus,
  contextType,
}) => {
  const translations = useTranslations('components.make_payment');
  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');

  const invoicePaymentRecordDraft =
    !isPurchasePage && SessionStorageService.get('invoicePaymentRecordDraft');
  const invoicePaymentAdviceDraft =
    isPurchasePage && SessionStorageService.get('invoicePaymentAdviceDraft');

  const [files, setFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState(
    !isPurchasePage
      ? {
          orderId: invoiceDetails?.orderId,
          amount: invoicePaymentRecordDraft?.amount || '',
          bankAccountId: invoicePaymentRecordDraft?.bankAccountId || '',
          paymentMode: invoicePaymentRecordDraft?.paymentMode || '',
          transactionId: invoicePaymentRecordDraft?.transactionId || '',
          invoices: invoicePaymentRecordDraft?.invoices || [],
          paymentDate: invoicePaymentRecordDraft?.paymentDate || '',
        }
      : {
          orderId: invoiceDetails?.orderId,
          amount: invoicePaymentAdviceDraft?.amount || '',
          bankAccountId: invoicePaymentAdviceDraft?.bankAccountId || '',
          paymentMode: invoicePaymentAdviceDraft?.paymentMode || '',
          transactionId: invoicePaymentAdviceDraft?.transactionId || '',
          invoices: invoicePaymentAdviceDraft?.invoices || [],
          paymentDate: invoicePaymentAdviceDraft?.paymentDate || '',
        },
  );
  const [isBankAccountAdding, setIsBankAccountAdding] = useState(false);

  // save draft to session storage
  function saveDraftToSession({ isPurchasePage, data }) {
    const key = isPurchasePage
      ? 'invoicePaymentAdviceDraft'
      : 'invoicePaymentRecordDraft';
    SessionStorageService.set(key, data);
  }

  // api call for invoices
  const { data: invoicesForPayments } = useQuery({
    queryKey: [
      paymentApi.getInvoicesForPayments.endpointKey,
      invoiceDetails?.orderId,
    ],
    queryFn: () =>
      getInvoicesForPayments(
        invoiceDetails?.orderId,
        invoiceDetails?.invoiceId,
      ),
    select: (invoicesForPayments) => invoicesForPayments.data.data,
    enabled: !!invoiceDetails?.orderId,
  });

  // Update the invoices state once invoicesForPayments data is fetched
  useEffect(() => {
    const updatedInvoices = invoicesForPayments?.data?.map((invoice) => ({
      ...invoice,
      invoiceId: invoice.invoicereceivableinvoiceid,
      amount: 0, // Adding amountPaid to each invoice
    }));
    setInvoices(updatedInvoices);
  }, [invoicesForPayments]);

  const { data: bankAccounts } = useQuery({
    queryKey: [bankAccountApis.getBankAccounts.endpointKey],
    queryFn: () => getBankAccounts(),
    select: (data) => data.data.data,
  });

  // mutation for create payment
  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: (res) => {
      toast.success(translations('successMsg.payment_recorded_sucessfully'));
      setErrorMsg({});
      setInvoices([]);
      setPaymentData({
        amount: null,
        paymentMode: null,
        transactionId: null,
        invoices: [],
      });
      // setIsRecordingPayment(false);
      if (isPurchasePage) {
        router.push(`/purchases/purchase-payments/${res.data.data.id}`);
        SessionStorageService.remove('invoicePaymentAdviceDraft');
      } else {
        router.push(`/sales/sales-payments/${res.data.data.id}`);
        SessionStorageService.remove('invoicePaymentRecordDraft');
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || translations('errorMsg.common');
      toast.error(errorMessage);
    },
  });

  // handleInputChange fn
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const balanceAmount = parseFloat(
      invoicesForPayments?.invoicedTotalDueAmount,
    );

    if (name === 'amount') {
      // Allow only numbers & decimals, treating "0" as valid text input
      if (/^\d*\.?\d*$/.test(value)) {
        const updatedPaymentData = {
          ...paymentData,
          [name]: value, // Store as string to preserve input format
        };
        setPaymentData(updatedPaymentData);

        saveDraftToSession({
          isPurchasePage,
          data: updatedPaymentData,
        });
      }
    } else {
      const updatedPaymentData = {
        ...paymentData,
        [name]: value, // Store as string to preserve input format
      };
      setPaymentData(updatedPaymentData);

      saveDraftToSession({
        isPurchasePage,
        data: updatedPaymentData,
      });
    }

    if (name === 'amount') {
      const numericValue = parseFloat(value); // Convert to number for validation

      if (value === '') {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: translations('errorMsg.amount_paid_empty'),
        }));
      } else if (!Number.isNaN(numericValue) && numericValue > balanceAmount) {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: translations('errorMsg.amount_paid_exceed'),
        }));
      } else {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: '',
        }));
      }
    }
  };

  // handle upload proofs fn
  const handleAttached = async (file) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    toast.success('File attached successfully!');
  };

  const handleFileRemove = (file) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
  };

  const validation = (updatedPaymentData) => {
    const error = {};

    // invoices
    if (updatedPaymentData?.invoices?.length === 0) {
      error.invoices = translations('errorMsg.invoices');
    }

    // payment date
    if (!updatedPaymentData?.paymentDate) {
      error.paymentDate = translations('errorMsg.payment_date');
    }

    // payment mode
    if (
      !updatedPaymentData.paymentMode ||
      updatedPaymentData.paymentMode.trim() === ''
    ) {
      error.paymentMode =
        translations('errorMsg.payment_mode') ||
        'Please select a payment mode.';
    }

    // amount paid
    if (
      !updatedPaymentData.amount ||
      Number.isNaN(updatedPaymentData.amount) ||
      Number(updatedPaymentData.amount) <= 0
    ) {
      error.amountPaid =
        translations('errorMsg.amount_paid_required') ||
        'Amount must be greater than 0.';
    }

    // Update error state
    return error;
  };

  // hanlde submit fn
  const handleSubmit = () => {
    const amount = Number(paymentData?.amount) || 0;

    // Filter and map invoices: only include those where amount > 0
    const refactoredInvoices =
      invoices
        ?.filter(() => amount > 0) // filter globally based on the entered amount
        .map(({ invoiceId }) => ({
          invoiceId,
          amount,
        })) || [];

    const updatedPaymentData = {
      ...paymentData,
      amount,
      invoices: refactoredInvoices,
    };

    const isErrors = validation(updatedPaymentData);
    // If no errors, proceed
    if (Object.keys(isErrors).length === 0) {
      // Build FormData
      const formData = new FormData();
      // handle files if any
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }
      formData.append('orderId', updatedPaymentData.orderId);
      formData.append('paymentMode', updatedPaymentData.paymentMode);
      formData.append('transactionId', updatedPaymentData.transactionId);
      formData.append('context', contextType);
      formData.append('invoices', JSON.stringify(updatedPaymentData.invoices));
      formData.append('amount', amount);
      const formattedPaymentDate = moment(
        updatedPaymentData.paymentDate,
      ).format('DD/MM/YYYY');
      formData.append('paymentDate', formattedPaymentDate);
      formData.append('bankAccountId', updatedPaymentData.bankAccountId);

      createPaymentMutationFn.mutate(formData);
    } else {
      setErrorMsg(isErrors);
    }
  };

  return (
    <Wrapper className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-2">
        {/* Collapsable overview */}
        <InvoiceOverview
          isCollapsableOverview={true}
          invoiceDetails={invoiceDetails}
          invoiceId={invoiceDetails?.invoiceReferenceNumber}
          orderId={invoiceDetails?.orderId}
          orderRefId={invoiceDetails?.orderReferenceNumber}
          paymentStatus={paymentStatus}
          debitNoteStatus={debitNoteStatus}
          Name={`${invoiceDetails?.customerName} (${invoiceDetails?.clientType})`}
          type={invoiceDetails?.invoiceType}
          date={invoiceDetails?.createdAt}
          amount={invoiceDetails?.totalAmount}
          amountPaid={invoiceDetails?.amountPaid}
        />

        {isBankAccountAdding && (
          <AddBankAccount
            isModalOpen={isBankAccountAdding}
            setIsModalOpen={setIsBankAccountAdding}
          />
        )}

        <div className="flex flex-col gap-4">
          {/* inputs */}
          <section className="flex flex-col gap-4 rounded-md border p-4">
            <div className="flex items-center">
              {/* select payment mode */}
              <div className="flex w-1/2 flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('form.label.payment_mode')}
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>

                <Select
                  value={paymentData?.paymentMode}
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
                  <SelectTrigger className="max-w-md">
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
              <div className="flex w-1/2 flex-col gap-2">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('form.label.payment_date')}
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <div className="relative flex h-10 max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
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

            <div className="flex items-center">
              {/* Bank Account Details */}
              <div className="flex w-1/2 flex-col gap-3">
                <Label className="text-sm font-semibold">
                  {translations('form.label.bank_acc_details')}
                </Label>
                <div className="flex flex-col gap-1">
                  <Select
                    value={paymentData.bankAccountId}
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
                      className="max-w-md"
                      disabled={paymentData.paymentMode === 'cash'}
                    >
                      <SelectValue placeholder="Select" />
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
                        className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-gray-100"
                      >
                        <Plus size={14} />
                        Add New Bank Account
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* transaction ID */}
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.tran_id')}
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    name="transactionId"
                    className="max-w-md"
                    disabled={
                      !paymentData.paymentMode ||
                      paymentData.paymentMode === 'cash'
                    }
                    value={paymentData.transactionId}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center">
              {/* Amount */}
              <div className="flex w-1/2 flex-col gap-2">
                <div>
                  <Label className="text-sm font-semibold">
                    {translations('form.label.amount_paid')}
                  </Label>{' '}
                  <span className="text-red-600">*</span>
                </div>
                <div className="flex items-center gap-1">
                  <Input
                    name="amount"
                    className="max-w-md"
                    value={paymentData.amount}
                    onChange={handleInputChange}
                  />
                </div>
                {errorMsg.amountPaid && <ErrorBox msg={errorMsg.amountPaid} />}
              </div>

              {/* Balance */}
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="text-sm font-semibold">
                  {translations('form.label.balance')}
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    className="max-w-md"
                    value={formattedAmount(
                      invoicesForPayments?.invoicedTotalDueAmount,
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* uploads payments proofs */}
          <div className="flex flex-col gap-4">
            <Label className="text-sm font-semibold">
              {translations('form.upload_proof.title')}
            </Label>
            <div className="flex flex-wrap gap-4">
              {files?.map((file) => (
                <div
                  key={file.name}
                  className="relative flex w-64 flex-col gap-2 rounded-xl border border-neutral-300 bg-white p-4 shadow-sm"
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
                      // eslint-disable-next-line jsx-a11y/alt-text
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
              <div className="mb-2 flex min-w-[700px] cursor-pointer items-center justify-between gap-3 rounded border-2 border-dashed border-[#288AF9] px-5 py-10">
                <div className="flex items-center gap-4">
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
                <Button variant="blue_outline">
                  <Upload />
                  {translations('form.upload_proof.ctas.select')}
                </Button>
              </div>
            </FileUploader>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex w-full justify-end gap-2 border-t-2 bg-white p-2">
        <Button
          variant="outline"
          className="w-32"
          size="sm"
          onClick={() => {
            // state clear
            setIsRecordingPayment(false);
            setInvoices([]);
            setErrorMsg({});
            setPaymentData({
              amount: '',
              paymentMode: '',
              transactionId: '',
              attachmentLink: '', // If it's a FormData object, consider setting it to null
              invoices: [],
            });
            router.back();
          }}
        >
          {translations('form.ctas.discard')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={createPaymentMutationFn.isPending}
          size="sm"
          className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
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

export default MakePaymentNewInvoice;
