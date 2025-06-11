import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';

export default function PaymentSettings({ settings, createSettingMutation }) {
  const translations = useTranslations('components.paymentSettings');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState(null);

  useEffect(() => {
    if (settings?.settings) {
      const paymentTermsSettings = settings.settings.find(
        (s) => s.key === 'payment-terms.terms',
      );
      if (paymentTermsSettings) {
        setPaymentTerms(paymentTermsSettings.value);
      }

      const paymentDueDateSettings = settings.settings.find(
        (s) => s.key === 'payment-terms.duedate',
      );
      if (paymentDueDateSettings) {
        setPaymentDueDate(paymentDueDateSettings.value);
      }
    }
  }, [settings]);

  const handlePaymentTerms = (paymentTerms) => {
    const payload = {
      contextKey: 'PAYMENT_TERMS',
      settings: [
        {
          key: 'payment-terms.terms',
          value: paymentTerms,
        },
      ],
    };

    createSettingMutation.mutate(payload);
  };

  const handlePaymentDueDate = (paymentDueDate) => {
    const payload = {
      contextKey: 'PAYMENT_TERMS',
      settings: [
        {
          key: 'payment-terms.duedate',
          value: paymentDueDate,
        },
      ],
    };

    createSettingMutation.mutate(payload);
  };

  return (
    <div className="flex h-full w-full gap-4">
      {/* payment terms */}
      <div className="flex w-1/2 flex-col">
        <Label className="mb-2 block text-sm font-medium">
          {translations('label_terms')}
        </Label>
        <Textarea
          value={paymentTerms}
          onChange={(e) => setPaymentTerms(e.target.value)}
          className="h-28 w-full resize-none rounded-md border p-2"
          placeholder={translations('placeholder_terms')}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPaymentTerms('');
            }}
          >
            {translations('btn_discard')}
          </Button>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => {
              handlePaymentTerms(paymentTerms);
            }}
          >
            {translations('btn_save')}
          </Button>
        </div>
      </div>
      {/* due date */}
      <div className="flex w-1/2 flex-col">
        <Label className="mb-2 block text-sm font-medium">
          {translations('label_due_date')}
        </Label>
        <Input
          type="number"
          value={paymentDueDate}
          onChange={(e) => setPaymentDueDate(e.target.value)}
          placeholder={translations('placeholder_due_date')}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPaymentDueDate(null);
            }}
          >
            {translations('btn_discard')}
          </Button>
          <Button
            size="sm"
            variant="blue_outline"
            onClick={() => {
              handlePaymentDueDate(paymentDueDate);
            }}
          >
            {translations('btn_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
