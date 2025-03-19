'use client';

import { invoiceApi } from '@/api/invoice/invoiceApi';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from '@/i18n/routing';
import {
  createInvoiceForAcceptedOrder,
  createInvoiceForNewOrder,
} from '@/services/Invoice_Services/Invoice_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { FileCog } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import Slot from '../ui/Slot';

const GenerateInvoiceModal = ({
  orderDetails,
  invoicedData,
  setInvoicedData,
  disableCondition,
  setIsGenerateInvoice,
  handleClose,
}) => {
  const translations = useTranslations('components.generate_invoice_modal_otp');
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const orderId = params.order_id;
  const [open, setOpen] = useState(false);
  const [isPINVerified, setPINVerified] = useState(false);

  // mutation fn - generate Invoice : IF ACCEPTED
  const invoiceMutation = useMutation({
    mutationKey: [invoiceApi.createInvoiceForAcceptedOrder.endpointKey],
    mutationFn: createInvoiceForAcceptedOrder,
    onSuccess: () => {
      setPINVerified(true);
      toast.success(translations('successMsg.invoice_generate_success'));
      queryClient.invalidateQueries([
        invoiceApi.getInvoices.endpointKey,
        orderId,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  // mutation fn - new generate Invoice : IF NEW
  const invoiceMutationNew = useMutation({
    mutationKey: [invoiceApi.createInvoiceForNewOrder.endpointKey],
    mutationFn: createInvoiceForNewOrder,
    onSuccess: () => {
      setPINVerified(true);
      toast.success(translations('successMsg.invoice_generate_success'));
      router.push('/sales/sales-orders');
    },
    onError: (error) => {
      toast.error(
        error.response.data.message || translations('errorMsg.common'),
      );
    },
  });

  const handleChangeOtp = (value) => {
    setInvoicedData((prev) => ({
      ...prev,
      pin: value,
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
        <Button size="sm" disabled={disableCondition}>
          <FileCog size={16} />
          {translations('ctas.generate')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[40rem] overflow-hidden">
        <DialogTitle>{translations('title')}</DialogTitle>
        {/* PIN */}
        {!isPINVerified && (
          <form
            onSubmit={handleVerifiyOTP}
            className="z-20 flex flex-col items-center justify-center gap-5 p-5"
          >
            <div className="flex w-full flex-col gap-2">
              <h2 className="w-full text-center text-2xl font-bold">
                {translations('infoText.title')}
              </h2>
              <p className="flex w-full flex-col items-center gap-1 text-center text-sm">
                {translations('infoText.info')}

                <span
                  className="cursor-pointer text-primary underline hover:text-black"
                  onClick={() => router.push('/profile')}
                >
                  {translations('infoText.info2')}
                </span>
              </p>
            </div>

            <OTPInput
              name="otp"
              onChange={handleChangeOtp}
              maxLength={4}
              value={invoicedData?.pin}
              containerClassName="group flex items-center has-[:disabled]:opacity-30"
              render={({ slots }) => (
                <div className="flex gap-4">
                  {slots.map((slot) => (
                    <Slot key={uuidv4()} {...slot} />
                  ))}
                </div>
              )}
            />
            <Button
              size="sm"
              type="submit"
              className="w-full"
              disabled={
                invoiceMutation.isPending || invoiceMutationNew.isPending
              }
            >
              {invoiceMutation.isPending || invoiceMutationNew.isPending ? (
                <Loading />
              ) : (
                translations('ctas.verify')
              )}
            </Button>
          </form>
        )}

        {/* Confirm Action dialog */}
        {isPINVerified && invoiceMutation.isPending && <Loading />}

        {isPINVerified && invoiceMutation.isSuccess && (
          <>
            <div className="flex items-center gap-2 text-xl font-bold">
              {translations('successMsg.invoice_generate_success')}
            </div>
            <div className="mt-auto flex items-center justify-end gap-4">
              <Button
                size="sm"
                className="bg-green-700 text-white hover:bg-green-800 hover:text-white"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  handleClose();
                  setIsGenerateInvoice(false);
                  router.back();
                }}
              >
                {translations('ctas.view')}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GenerateInvoiceModal;
