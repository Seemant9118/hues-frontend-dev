import { orderApi } from '@/api/order_api/order_api';
import { paymentApi } from '@/api/payments/payment_api';
import { formattedAmount } from '@/appUtils/helperFunctions';
import {
  createPayment,
  getInvoicesForPayments,
} from '@/services/Payment_Services/PaymentServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, RotateCcw, Upload, UploadCloud, X } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { FileUploader } from 'react-drag-drop-files';
import { toast } from 'sonner';
import ConditionalRenderingStatus from '../orders/ConditionalRenderingStatus';
import OrdersOverview from '../orders/OrdersOverview';
import { Button } from '../ui/button';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import Wrapper from '../wrappers/Wrapper';

const MakePaymentNew = ({
  orderId,
  orderDetails,
  setIsRecordingPayment,
  contextType,
}) => {
  const translations = useTranslations('components.record_payment_order');
  const queryClient = useQueryClient();
  const [isAutoSplitted, setIsAutoSplitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const [files, setFiles] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: '',
    transactionId: '',
    invoices,
  });

  const { data: invoicesForPayments, isLoading } = useQuery({
    queryKey: [paymentApi.getInvoicesForPayments.endpointKey, orderId],
    queryFn: () => getInvoicesForPayments(orderId),
    enabled: !!orderId,
    select: (invoicesForPayments) => invoicesForPayments.data.data,
  });

  // Update the invoices state once invoicesForPayments data is fetched
  useEffect(() => {
    if (invoicesForPayments) {
      const updatedInvoices = invoicesForPayments?.data?.map((invoice) => ({
        ...invoice,
        invoiceId: invoice.invoicereceivableinvoiceid,
        amount: 0, // Adding amountPaid to each invoice
      }));
      setInvoices(updatedInvoices);
    }
  }, [invoicesForPayments]);

  // payments splitFn
  const splitFn = (totalAmount) => {
    let remainingAmount = totalAmount;

    const updatedInvoices = invoices.map((invoice) => {
      const balanceAmount = invoice.invoicereceivabledueamount;

      if (remainingAmount > balanceAmount) {
        // Pay full balance amount for this invoice
        remainingAmount -= balanceAmount;
        return {
          ...invoice,
          amount: balanceAmount,
        };
      } else {
        // Pay remaining amount to this invoice
        const amountToPay = remainingAmount;
        remainingAmount = 0;
        return {
          ...invoice,
          amount: amountToPay,
        };
      }
    });

    setInvoices(updatedInvoices);
    setPaymentData((prevData) => ({
      ...prevData,
      invoices: updatedInvoices, // Only include invoices with amount > 0
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const balanceAmount = parseFloat(
      invoicesForPayments?.invoicedTotalDueAmount,
    );

    if (name === 'amount') {
      // Allow only numbers & decimals, treating "0" as valid text input
      if (/^\d*\.?\d*$/.test(value)) {
        setPaymentData((prevData) => ({
          ...prevData,
          [name]: value, // Keep as string to preserve leading zeros
        }));
      }
    } else {
      setPaymentData((prevData) => ({
        ...prevData,
        [name]: value, // Keep as string to preserve leading zeros
      }));
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

  const handleAmountPaidChange = (e, invoiceId, invoiceIndex) => {
    const { value } = e.target;
    const newAmountPaid = parseFloat(value) || 0;

    const updatedInvoices = invoices.map((invoice, idx) => {
      if (idx !== invoiceIndex) return invoice;
      return { ...invoice, amount: newAmountPaid };
    });

    const newErrorMessages = { ...errorMsg };
    const invoiceDue = invoices[invoiceIndex]?.invoicereceivabledueamount || 0;

    // Validate individual invoice amount
    if (newAmountPaid > invoiceDue) {
      newErrorMessages[invoiceId] =
        `${translations('errorMsg.amount_paid_not_greater_than')} ₹${invoiceDue}`;
    } else {
      newErrorMessages[invoiceId] = '';
    }

    // Validate total amount across all invoices
    const totalAmountPaid = updatedInvoices.reduce(
      (sum, inv) => sum + (Number(inv.amount) || 0),
      0,
    );
    const expectedAmount = Number(paymentData.amount) || 0;

    if (totalAmountPaid > expectedAmount) {
      newErrorMessages.invoiceAmountPaid = translations(
        'errorMsg.invoiceAmountPaid_exceed',
      );
    } else if (totalAmountPaid < expectedAmount) {
      newErrorMessages.invoiceAmountPaid = translations(
        'errorMsg.invoiceAmountPaid_less',
      );
    } else {
      newErrorMessages.invoiceAmountPaid = '';
    }

    setInvoices(updatedInvoices);
    setErrorMsg(newErrorMessages);
    setPaymentData((prev) => ({
      ...prev,
      invoices: updatedInvoices,
    }));
  };

  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success(translations('successMsg.payment_recorded_sucessfully'));
      setInvoices([]);
      setErrorMsg({});
      setPaymentData({
        amount: '',
        paymentMode: '',
        transactionId: '',
        invoices: [],
      });
      setFiles([]);
      queryClient.invalidateQueries([
        paymentApi.getPaymentsList.endpointKey,
        orderId,
      ]);
      queryClient.invalidateQueries([
        orderApi.getOrderDetails.endpointKey,
        orderId,
      ]);
      setIsRecordingPayment(false);
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message || translations('errorMsg.common');
      toast.error(errorMessage);
    },
  });

  const handleUploadChange = async (file) => {
    setFiles((prevFiles) => [...prevFiles, file]);
    toast.success('File attached successfully!');
  };

  const handleSubmit = () => {
    // Filter invoices where amountPaid > 0
    const filteredInvoices = invoices.filter((invoice) => invoice.amount > 0);

    const refactoredInvoices = filteredInvoices.map((invoice) => ({
      invoiceId: invoice.invoiceId,
      amount: Number(invoice.amount),
    }));

    // Update paymentData with filtered invoices
    const updatedPaymentData = {
      ...paymentData,
      invoices: filteredInvoices,
    };

    // validation
    if (updatedPaymentData.paymentMode === '') {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        paymentMode: translations('errorMsg.payment_mode'),
      }));
    } else {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        paymentMode: '',
      }));
    }

    if (updatedPaymentData.amount === '') {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        amountPaid: translations('errorMsg.amount_paid_required'),
      }));
    } else {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        amountPaid: '',
      }));
    }

    if (Object.values(errorMsg).some((msg) => msg === '')) {
      const formData = new FormData();
      // handle files if any
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }
      formData.append('orderId', orderId);
      formData.append('paymentMode', updatedPaymentData.paymentMode);
      formData.append('transactionId', updatedPaymentData.transactionId);
      formData.append('context', contextType);
      formData.append('invoices', JSON.stringify(refactoredInvoices));
      formData.append('amount', updatedPaymentData.amount);

      createPaymentMutationFn.mutate(formData);
    }
  };

  // multiStatus components
  const multiStatus = (
    <div className="flex gap-2">
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.sellerData?.orderStatus}
      />
      <ConditionalRenderingStatus
        status={orderDetails?.metaData?.payment?.status}
      />
    </div>
  );

  return (
    <Wrapper className="h-full py-2">
      {/* Collapsable overview */}
      <OrdersOverview
        isCollapsableOverview={true}
        orderDetails={orderDetails}
        orderId={orderDetails?.referenceNumber}
        multiStatus={multiStatus}
        Name={`${orderDetails?.clientName} (${orderDetails?.clientType})`}
        mobileNumber={orderDetails?.mobileNumber}
        amtPaid={orderDetails?.amountPaid}
        totalAmount={orderDetails.amount + orderDetails.gstAmount}
      />
      <div className="flex flex-col gap-4">
        {/* inputs */}
        <section className="flex flex-col gap-4 rounded-md border p-4">
          <div className="flex items-center">
            {/* select payment mode */}
            <div className="flex w-1/2 flex-col gap-2">
              <div>
                <Label className="flex-shrink-0">
                  {translations('form.label.payment_mode')}
                </Label>{' '}
                <span className="text-red-600">*</span>
              </div>

              <Select
                defaultValue={paymentData.paymentMode}
                onValueChange={(value) => {
                  // Check if a payment mode is selected (non-empty value)
                  if (value) {
                    setErrorMsg((prevMsg) => ({
                      ...prevMsg,
                      paymentMode: '', // Clear the payment mode error message
                    }));
                  }
                  setPaymentData((prevData) => ({
                    ...prevData,
                    paymentMode: value,
                  }));
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

              {errorMsg.paymentMode && <ErrorBox msg={errorMsg.paymentMode} />}
            </div>
            {/* transaction ID */}
            <div className="flex w-1/2 flex-col gap-3">
              <Label> {translations('form.label.tran_id')}</Label>
              <div className="flex flex-col gap-1">
                <Input
                  name="transactionId"
                  className="max-w-md"
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
                <Label className="flex-shrink-0">
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
                {paymentData.amount && (
                  <span
                    onClick={() => {
                      if (isAutoSplitted) {
                        setIsAutoSplitted(false);
                        // Reset the amountPaid for each invoice to 0
                        const resetInvoices = invoices.map((invoice) => ({
                          ...invoice,
                          amount: 0, // Reset amount to 0
                        }));

                        setInvoices(resetInvoices); // Update invoices with the reset values

                        setPaymentData((prevData) => ({
                          ...prevData,
                          amount: '',
                          invoices: resetInvoices, // Use the reset invoices
                        }));
                        setErrorMsg({});
                      } else {
                        splitFn(paymentData.amount); // Call splitFn to distribute amount across invoices
                        setIsAutoSplitted(true);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-0.5 text-xs font-bold text-[#288AF9] hover:underline"
                  >
                    {Object.values(errorMsg).some((msg) => msg === '') && (
                      <>
                        {isAutoSplitted ? (
                          <>
                            <X size={12} />
                            Revert
                          </>
                        ) : (
                          <>
                            <RotateCcw size={12} /> Auto-split
                          </>
                        )}
                      </>
                    )}
                  </span>
                )}
              </div>
              {errorMsg.amountPaid && <ErrorBox msg={errorMsg.amountPaid} />}
            </div>

            {/* Balance */}
            <div className="flex w-1/2 flex-col gap-3">
              <Label>{translations('form.label.balance')}</Label>
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

        {/* Invoice table  */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold">
            {translations('form.table.title')}
          </h2>
          {isAutoSplitted && (
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-[#A5ABBD]">
                {translations('form.table.para')}
              </span>

              {errorMsg.invoiceAmountPaid && (
                <ErrorBox msg={errorMsg.invoiceAmountPaid} />
              )}
            </div>
          )}
          {/* Invoice Selection Table */}
          {isLoading ? (
            <Loading />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    colSpan={3}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    {translations('form.table.header.label.invoice_no')}
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    {translations('form.table.header.label.date')}
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    {translations('form.table.header.label.quantity')}
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    {translations('form.table.header.label.balance_amt')}
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    {translations('form.table.header.label.amount_paid')}
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="shrink-0">
                {invoices?.map((invoice, index) => (
                  <TableRow key={invoice.invoicereceivableinvoiceid}>
                    <TableCell colSpan={3}>
                      {invoice.invoicereferencenumber}
                    </TableCell>

                    <TableCell colSpan={2}>
                      {moment(invoice.invoicecreatedat).format('DD-MM-YYYY')}
                    </TableCell>

                    <TableCell colSpan={2}>{invoice.totalquantity}</TableCell>

                    <TableCell colSpan={2}>
                      {formattedAmount(invoice.invoicereceivabledueamount)}
                    </TableCell>

                    <TableCell colSpan={2}>
                      <Input
                        className="mb-2 w-32"
                        disabled={
                          !isAutoSplitted ||
                          invoice.invoicereceivabledueamount === 0
                        }
                        value={invoice.amount}
                        onChange={(e) =>
                          handleAmountPaidChange(e, invoice.invoiceId, index)
                        }
                      />
                      {errorMsg[invoice.invoiceId] && (
                        <ErrorBox msg={errorMsg[invoice.invoiceId]} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* uploads payments proofs */}
        <div className="flex flex-col gap-4">
          <Label>{translations('form.upload_proof.title')}</Label>
          {files?.map((file) => (
            <div
              key={file.name}
              className="flex min-w-[700px] items-center justify-between gap-4 rounded-sm border border-neutral-300 p-4"
            >
              <div className="flex items-center gap-4">
                <p className="text-xs font-medium leading-[18px]">
                  {file.name}
                </p>
                <div className="h-1 w-1 rounded-full bg-neutral-400"></div>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                    <Check size={10} />
                  </div>
                  <p className="text-xs font-medium leading-5 text-green-500">
                    {translations('successMsg.upload_success')}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <FileUploader
            handleChange={handleUploadChange}
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
          }}
        >
          {translations('form.ctas.discard')}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            Object.values(errorMsg).some((msg) => msg !== '') ||
            createPaymentMutationFn.isPending
          }
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

export default MakePaymentNew;
