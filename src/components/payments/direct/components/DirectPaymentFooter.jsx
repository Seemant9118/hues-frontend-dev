import React from 'react';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';

export default function DirectPaymentFooter({
  setIsPaymentRecording,
  setErrorMsg,
  setPaymentData,
  handleSubmit,
  isPending,
  translations,
}) {
  return (
    <div className="sticky bottom-0 z-20 flex w-full flex-col-reverse gap-2 border-t-2 bg-white/95 p-3 backdrop-blur sm:flex-row sm:justify-end sm:p-4">
      <Button
        variant="outline"
        className="w-full sm:w-32"
        size="sm"
        onClick={() => {
          setIsPaymentRecording(false);
          setErrorMsg({});
          setPaymentData({
            amount: '',
            paymentMode: '',
            transactionId: '',
            invoices: [],
            bankAccountId: '',
          });
        }}
      >
        {translations('form.ctas.discard')}
      </Button>
      <Button
        onClick={handleSubmit}
        disabled={isPending}
        size="sm"
        className="w-full bg-[#288AF9] text-white hover:bg-primary hover:text-white sm:w-32"
      >
        {isPending ? <Loading /> : translations('form.ctas.create')}
      </Button>
    </div>
  );
}
