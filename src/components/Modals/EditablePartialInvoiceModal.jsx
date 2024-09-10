/* eslint-disable consistent-return */
import { invoiceApi } from '@/api/invoice/invoiceApi';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { LocalStorageService } from '@/lib/utils';
import {
  createInvoiceForAcceptedOrder,
  createInvoiceForNewOrder,
  invoiceGenerateOTP,
  previewInvoice,
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { Clock5, FileText } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useItemsColumns } from '../columns/useItemsColumns';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import Slot from '../ui/Slot';
import GenerateInvoiceModal from './GenerateInvoiceModal';
import PreviewInvoice from './PreviewInvoiceModal';

const EditablePartialInvoiceModal = ({ orderDetails, setIsPastInvoices }) => {
  const queryClient = useQueryClient();
  const userMobileNumber = LocalStorageService.get('user_mobile_number');
  const router = useRouter();
  const { order_id: orderId } = useParams();

  const [isOTPVerified, setOTPVerified] = useState(false);
  const [startFrom, setStartFrom] = useState(30);
  const [open, setOpen] = useState(false);
  const [invoicedData, setInvoicedData] = useState({
    otpCode: null,
    orderId: orderDetails?.id,
    gstAmount: orderDetails?.gstAmount,
    amount: orderDetails?.amount,
    orderType: orderDetails?.orderType,
    invoiceType: orderDetails?.invoiceType || 'GOODS',
    invoiceItems: [],
  });
  const [productDetailsList, setProductDetailsList] = useState([]);
  const [initialQuantities, setInitialQuantities] = useState([]);
  const [previewInvoiceBase64, setPreviewInvoiceBase64] = useState('');

  useEffect(() => {
    if (startFrom <= 0) return;

    const timer = setInterval(() => {
      setStartFrom((prev) => prev - 1);
    }, 1000);

    // Cleanup function to clear the timer
    return () => clearInterval(timer);
  }, [startFrom]); // Dependency array includes startFrom

  const calculatedInvoiceQuantity = (quantity, invoiceQuantity) => {
    const calculatedQty = quantity - invoiceQuantity;
    return Math.max(calculatedQty, 0);
  };

  useEffect(() => {
    if (orderDetails?.orderItems) {
      const initialQtys = orderDetails.orderItems.map((item) => item.quantity);
      setInitialQuantities(initialQtys);

      const getInitialProductDetailsList = orderDetails.orderItems.map(
        (item) => ({
          ...item.productDetails,
          productType: item.productType,
          orderItemId: item.id,
          quantity: calculatedInvoiceQuantity(
            item.quantity,
            item.invoiceQuantity,
          ),
          unitPrice: item.unitPrice,
          gstPerUnit: item.gstPerUnit,
          totalAmount: item.totalAmount,
          totalGstAmount: item.totalGstAmount,
        }),
      );

      setProductDetailsList(getInitialProductDetailsList);
      setInvoicedData((prev) => ({
        ...prev,
        invoiceItems: [],
      }));
    }
  }, [open, orderDetails]);

  const itemColumns = useItemsColumns({
    setInvoicedData,
    invoicedData,
    setProductDetailsList,
    productDetailsList,
    initialQuantities,
  });

  const onHandleClose = () => {
    setOpen(false);
    setProductDetailsList([]);
    setInvoicedData({
      ...invoicedData,
      invoiceItems: [],
    });
  };

  const previewInvMutation = useMutation({
    mutationKey: [invoiceApi.previewInvoice.endpointKey],
    mutationFn: previewInvoice,
    onSuccess: (data) => setPreviewInvoiceBase64(data?.data?.data),
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const generateOTPMutation = useMutation({
    mutationKey: [invoiceApi.generateOTPInvoice.endpointKey],
    mutationFn: invoiceGenerateOTP,
    onSuccess: () => toast.success('OTP sent'),
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const invoiceMutation = useMutation({
    mutationKey: [invoiceApi.createInvoiceForAcceptedOrder.endpointKey],
    mutationFn: createInvoiceForAcceptedOrder,
    onSuccess: () => {
      setOTPVerified(true);
      toast.success('Invoice Generated Successfully');
      queryClient.invalidateQueries([
        invoiceApi.getInvoices.endpointKey,
        orderId,
      ]);
    },
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const invoiceMutationNew = useMutation({
    mutationKey: [invoiceApi.createInvoiceForNewOrder.endpointKey],
    mutationFn: createInvoiceForNewOrder,
    onSuccess: () => {
      setOTPVerified(true);
      toast.success('Invoice Generated Successfully');
      queryClient.invalidateQueries([
        invoiceApi.getInvoices.endpointKey,
        orderId,
      ]);
      router.push('/sales-orders');
    },
    onError: (error) =>
      toast.error(error.response.data.message || 'Something went wrong'),
  });

  const handlePreview = () => previewInvMutation.mutate(invoicedData);

  const handleGenerateOTP = () => generateOTPMutation.mutate();

  const handleChangeOtp = (value) => {
    setInvoicedData((prev) => ({
      ...prev,
      otpCode: value,
    }));
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    const { amount, gstAmount, invoiceItems, orderType, ...newInvoicedData } =
      invoicedData;
    if (orderDetails?.negotiationStatus === 'NEW') {
      invoiceMutationNew.mutate(newInvoicedData);
    } else {
      invoiceMutation.mutate(invoicedData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="blue_outline"
          className="w-40 bg-blue-500/10 hover:bg-blue-500 hover:text-white"
          onClick={
            orderDetails?.negotiationStatus === 'NEW' ? handleGenerateOTP : ''
          }
        >
          <FileText size={14} />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent
        className={
          orderDetails?.negotiationStatus === 'NEW'
            ? 'min-w-4xl overflow-hidden'
            : 'max-w-4xl overflow-hidden'
        }
      >
        {orderDetails?.negotiationStatus === 'NEW' && (
          <>
            <DialogTitle>Invoice</DialogTitle>
            {!isOTPVerified && (
              <form
                onSubmit={handleVerifyOTP}
                className="z-20 mt-4 flex flex-col items-center justify-center gap-5 p-5"
              >
                <h2 className="w-full text-2xl font-bold">
                  Verify OTP To Generate
                </h2>
                <p className="w-full text-sm">
                  A one-time password has been sent to{' '}
                  <span className="font-bold text-[#414656]">
                    +91 {userMobileNumber}
                  </span>
                </p>
                <OTPInput
                  name="otp"
                  onChange={handleChangeOtp}
                  maxLength={4}
                  value={invoicedData?.otpCode}
                  containerClassName="group flex items-center has-[:disabled]:opacity-30"
                  render={({ slots }) => (
                    <div className="flex gap-4">
                      {slots.map((slot) => (
                        <Slot key={uuidv4()} {...slot} />
                      ))}
                    </div>
                  )}
                />
                <p className="flex w-full items-center gap-2 text-sm text-[#A5ABBD]">
                  Resend OTP in:{' '}
                  <span className="flex items-center gap-1 font-semibold">
                    {startFrom > 0 ? (
                      <span className="flex items-center gap-1">
                        <Clock5 size={15} />
                        00:{startFrom.toString().padStart(2, '0')}
                      </span>
                    ) : (
                      <Button variant="outline" onClick={handleGenerateOTP}>
                        Resend
                      </Button>
                    )}
                  </span>
                </p>
                <Button type="submit" className="w-full">
                  {invoiceMutation.isLoading ? (
                    <Loading />
                  ) : (
                    'Verify To Generate'
                  )}
                </Button>
              </form>
            )}
            {isOTPVerified && invoiceMutation.isPending && <Loading />}
            {isOTPVerified && invoiceMutation.isSuccess && (
              <>
                <div className="flex items-center gap-2 text-xl font-bold">
                  Invoice Generated Successfully🎉
                </div>
                <div className="mt-auto flex items-center justify-end gap-4">
                  <Button
                    className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      onHandleClose();
                      setIsPastInvoices(true);
                    }}
                  >
                    View
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {orderDetails?.negotiationStatus === 'ACCEPTED' && (
          <section>
            <DialogTitle>Invoice</DialogTitle>
            <div className="mt-4 flex flex-col gap-4">
              <DataTable columns={itemColumns} data={productDetailsList} />
              <div className="flex gap-2">
                {/* previewInvoice */}
                <PreviewInvoice
                  base64StrToRenderPDF={previewInvoiceBase64}
                  mutationFn={handlePreview}
                  disableCondition={invoicedData?.invoiceItems?.length === 0}
                />

                {/* generateInvoice */}
                <GenerateInvoiceModal
                  orderDetails={orderDetails}
                  invoicedData={invoicedData}
                  setInvoicedData={setInvoicedData}
                  generateOTP={handleGenerateOTP}
                  disableCondition={invoicedData?.invoiceItems?.length === 0}
                  setIsPastInvoices={setIsPastInvoices}
                  handleClose={onHandleClose}
                />
              </div>
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditablePartialInvoiceModal;
