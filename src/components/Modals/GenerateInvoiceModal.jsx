'use client';

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
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { Clock5, FileCog } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import Slot from '../ui/Slot';

const GenerateInvoiceModal = ({
  orderDetails,
  invoicedData,
  setInvoicedData,
  generateOTP,
  disableCondition,
  setIsPastInvoices,
  handleClose,
}) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const orderId = params.order_id;

  const userMobileNumber = LocalStorageService.get('user_mobile_number');
  const [open, setOpen] = useState(false);
  const [isOTPVerified, setOTPVerified] = useState(false);
  const [startFrom, setStartFrom] = useState(30);

  //   timer for resend
  useEffect(() => {
    if (startFrom <= 0) return; // Stop countdown when it reaches 0

    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    // eslint-disable-next-line consistent-return
    return () => clearInterval(timer);
  }, [startFrom]); // Add dependency to stop timer when countdown ends

  // mutation fn - generate Invoice : IF ACCEPTED
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
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation fn - new generate Invoice : IF NEW
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
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleChangeOtp = (value) => {
    setInvoicedData((prev) => ({
      ...prev,
      otpCode: value,
    }));
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    if (orderDetails?.negotiationStatus === 'NEW') {
      const { amount, gstAmount, invoiceItems, orderType, ...newInvoicedData } =
        invoicedData;
      invoiceMutationNew.mutate(newInvoicedData);
      return;
    }
    invoiceMutation.mutate(invoicedData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={generateOTP} disabled={disableCondition}>
          <FileCog size={16} />
          Generate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] overflow-hidden">
        <DialogTitle>Invoice</DialogTitle>
        {/* OTP */}
        {!isOTPVerified && (
          <form
            onSubmit={handleVerifiyOTP}
            className="z-20 flex flex-col items-center justify-center gap-5 p-5"
          >
            <h2 className="w-full text-2xl font-bold">
              Verify OTP To Generate
            </h2>
            <p className="w-full text-sm">
              A one time password has been sent to{' '}
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
                  <Button variant="outline" onClick={generateOTP}>
                    Resend
                  </Button>
                )}
              </span>
            </p>
            <Button type="submit" className="w-full">
              {invoiceMutation.isLoading ? <Loading /> : 'Verify To Generate'}
            </Button>
          </form>
        )}

        {/* Confirm Action dialog */}
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
                  handleClose();
                  setIsPastInvoices(true);
                }}
              >
                View
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateInvoiceModal;
