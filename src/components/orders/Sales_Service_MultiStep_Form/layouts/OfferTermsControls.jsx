'use client';

import ErrorBox from '@/components/ui/ErrorBox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function OfferTermsControls({
  formData = {},
  setFormData,
  errors = {},
}) {
  const updateFormData = (updates) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  return (
    <section className="space-y-6">
      {/* Top Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Payment Terms */}
        <div className="space-y-2">
          <Label>
            Payment Terms <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="e.g., 50% advance, 50% on completion"
            rows={3}
            value={formData.paymentTermsService || ''}
            onChange={(e) =>
              updateFormData({ paymentTermsService: e.target.value })
            }
          />
          {errors.paymentTermsService && (
            <ErrorBox msg={errors.paymentTermsService} />
          )}
          <p className="text-xs text-muted-foreground">
            Specify exact payment schedule and conditions
          </p>
        </div>

        {/* Offer Validity */}
        <div className="space-y-2">
          <Label>
            Offer Validity <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="e.g., Valid for 30 days from date of issue"
            rows={3}
            value={formData.offerValidity || ''}
            onChange={(e) => updateFormData({ offerValidity: e.target.value })}
          />
          {errors.offerValidity && <ErrorBox msg={errors.offerValidity} />}
          <p className="text-xs text-muted-foreground">
            How long this offer remains valid
          </p>
        </div>
      </div>
    </section>
  );
}
