import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import { paymentApi } from '@/api/payments/payment_api';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  createPayment,
  getInvoicesForPayments,
  uploadPaymentProofs,
} from '@/services/Payment_Services/PaymentServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, RotateCcw, Upload, UploadCloud, X } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
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

const MakePaymentNew = ({ orderId, orderDetails, setIsRecordingPayment }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [files, setFiles] = useState([]);

  const { data: invoicesForPayments, isLoading } = useQuery({
    queryKey: [paymentApi.getInvoicesForPayments.endpointKey, orderId],
    queryFn: () => getInvoicesForPayments(orderId),
    enabled: !!orderId,
    select: (invoicesForPayments) => invoicesForPayments.data.data,
  });

  const [isAutoSplitted, setIsAutoSplitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  // Set initial state for invoices
  const [invoices, setInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMode: '',
    transactionId: '',
    attachmentLink: '',
    invoices,
  });

  // Update the invoices state once invoicesForPayments data is fetched
  useEffect(() => {
    if (invoicesForPayments) {
      const updatedInvoices = invoicesForPayments.map((invoice) => ({
        ...invoice,
        invoiceId: invoice.invoicereceivableinvoiceid,
        amount: 0, // Adding amountPaid to each invoice
      }));
      setInvoices(updatedInvoices);
    }
  }, [invoicesForPayments]);

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
      orderDetails.amount + orderDetails.gstAmount - orderDetails.amountPaid,
    );

    setPaymentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'amount') {
      if (value > balanceAmount) {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: 'Amount exceeds balance amount',
        }));
      } else if (value === '') {
        setErrorMsg((prevMsg) => ({
          ...prevMsg,
          amountPaid: 'Amount should not be empty',
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
    const newAmountPaid = parseFloat(value) || 0; // Parse the input as a number or default to 0

    // Clone the error messages for invoices to update the specific error
    const newErrorMessages = { ...errorMsg };

    // Validate if the entered amount exceeds the invoice's balance amount
    if (newAmountPaid > invoices[invoiceIndex].invoicereceivabledueamount) {
      newErrorMessages[invoiceId] =
        `Amount Paid should not be greater than ₹${invoices[invoiceIndex].invoicereceivabledueamount}`;
    } else {
      newErrorMessages[invoiceId] = ''; // Clear the error if no issue
    }

    // Update the specific invoice's amount
    const updatedInvoices = invoices.map((inv, idx) =>
      idx === invoiceIndex
        ? { ...inv, amount: newAmountPaid } // Update the amount for the selected invoice
        : inv,
    );

    // Calculate total amount paid across all invoices
    const totalAmountPaid = updatedInvoices.reduce(
      (total, inv) => total + Number(inv.amount),
      0,
    );

    // Validate if the total amount paid matches the payment amount
    if (totalAmountPaid > paymentData.amount) {
      newErrorMessages.invoiceAmountPaid =
        'Amount exceeds the total payment amount';
    } else if (totalAmountPaid < paymentData.amount) {
      newErrorMessages.invoiceAmountPaid =
        'Amount is less than the total payment amount';
    } else {
      newErrorMessages.invoiceAmountPaid = ''; // Clear the error when amounts match
    }

    // Update the error state for individual invoices
    setErrorMsg(newErrorMessages);

    // Update the paymentData with the new invoices state
    setInvoices(updatedInvoices);

    setPaymentData((prevData) => ({
      ...prevData,
      invoices: updatedInvoices, // Ensure paymentData's invoices field is updated
    }));
  };

  const createPaymentMutationFn = useMutation({
    mutationKey: [paymentApi.createPayment.endpointKey],
    mutationFn: createPayment,
    onSuccess: () => {
      toast.success('Payment Recorded Successfully');
      setInvoices([]);
      setErrorMsg({});
      setPaymentData({
        amount: '',
        paymentMode: '',
        transactionId: '',
        attachmentLink: '', // If it's a FormData object, consider setting it to null
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
        error?.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    },
  });

  const handleUploadChange = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('enterpriseId', enterpriseId);

    try {
      const resData = await uploadPaymentProofs(enterpriseId, formData);
      toast.success('Upload Successfully');
      setFiles((prev) => [...prev, file]);
      setPaymentData({
        ...paymentData,
        attachmentLink: resData?.data?.data,
      });
    } catch (error) {
      toast.error(error.response.data.message || 'Something went wrong');
    }
  };

  const handleSubmit = () => {
    // Filter invoices where amountPaid > 0
    const filteredInvoices = invoices.filter((invoice) => invoice.amount > 0);
    // Update paymentData with filtered invoices
    const updatedPaymentData = {
      ...paymentData,
      invoices: filteredInvoices,
    };

    // validation
    if (updatedPaymentData.paymentMode === '') {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        paymentMode: 'Required! Please select payment mode',
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
        amountPaid: 'Required!, Amount should not be empty',
      }));
    } else {
      setErrorMsg((prevMsg) => ({
        ...prevMsg,
        amountPaid: '',
      }));
    }

    if (Object.values(errorMsg).some((msg) => msg === '')) {
      createPaymentMutationFn.mutate(updatedPaymentData);
    }
  };

  // to get client name and number
  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });
  const client = clients?.find((clientData) => {
    const clientId = clientData?.client?.id ?? clientData?.id;
    return clientId === orderDetails?.buyerEnterpriseId;
  });

  const clientName =
    client?.client === null
      ? client?.invitation?.userDetails?.name
      : client?.client?.name;

  const clientNumber =
    client?.client === null
      ? client?.invitation?.invitationIdentifier
      : client?.client?.mobileNumber;

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
        Name={clientName}
        mobileNumber={clientNumber}
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
                <Label className="flex-shrink-0">Payment Mode</Label>{' '}
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
                  <SelectItem value="neft">NEFT</SelectItem>
                  <SelectItem value="rtgs">RTGS</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="creditDebitCard">
                    Credit / Debit Card
                  </SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>

              {errorMsg.paymentMode && <ErrorBox msg={errorMsg.paymentMode} />}
            </div>
            {/* transaction ID */}
            <div className="flex w-1/2 flex-col gap-3">
              <Label>Transaction ID</Label>
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
                <Label className="flex-shrink-0">Amount Paid</Label>{' '}
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
                          paymentMode: '',
                          transactionId: '',
                          attachmentLink: '',
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
              <Label>Balance</Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  className="max-w-md"
                  value={(
                    orderDetails.amount +
                    orderDetails.gstAmount -
                    orderDetails.amountPaid
                  ).toFixed(2)}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Invoice table  */}
        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-bold">Invoices</h2>
          {isAutoSplitted && (
            <div className="flex items-center justify-between px-2">
              <span className="text-sm text-[#A5ABBD]">
                Amount is auto-splitted, but you can customize it manually if
                needed
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
                    INVOICE NO
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    DATE
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    QUANTITY
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    BALANCE AMOUNT
                  </TableHead>
                  <TableHead
                    colSpan={2}
                    className="shrink-0 text-xs font-bold text-black"
                  >
                    AMOUNT PAID
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
                      {invoice.invoicereceivabledueamount.toFixed(2)}
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
          <Label>Upload Proof</Label>
          {files.map((file) => (
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
                    Upload Successfully!
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
                    Drag & Drop or Select a File (Max 10MB,
                    <span className="font-bold text-[#288AF9]">
                      {' '}
                      .png /.pdf Formats
                    </span>
                    )
                  </p>
                  <p className="text-xs font-normal text-[#288AF9]">
                    Note - Upload Payment Proofs only.
                  </p>
                </div>
              </div>
              <Button variant="blue_outline">
                <Upload />
                Select
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
            router.back();
          }}
        >
          Discard
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
          {createPaymentMutationFn.isPending ? <Loading /> : 'Create'}
        </Button>
      </div>
    </Wrapper>
  );
};

export default MakePaymentNew;
