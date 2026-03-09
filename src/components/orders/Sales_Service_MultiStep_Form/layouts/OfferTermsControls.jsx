'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ErrorBox from '@/components/ui/ErrorBox';

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

  const handleSelectChange = (name, value) => {
    updateFormData({ [name]: value });
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
            value={formData.paymentTerms || ''}
            onChange={(e) => updateFormData({ paymentTerms: e.target.value })}
          />
          {errors.paymentTerms && <ErrorBox msg={errors.paymentTerms} />}
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

      {/* Notes Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Notes / Special Instructions */}
        <div className="space-y-2">
          <Label>
            Notes / Special Instructions <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder='Enter instructions or type "Nil" if none'
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => updateFormData({ notes: e.target.value })}
          />
          {errors.notes && <ErrorBox msg={errors.notes} />}
          <p className="text-xs text-muted-foreground">
            Cannot be blank — enter &quot;Nil&quot; if not applicable
          </p>
        </div>

        {/* Notes to Customer */}
        <div className="space-y-2">
          <Label>
            Notes to Customer <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder='Enter customer-facing notes or type "Nil" if none'
            rows={3}
            value={formData.customerNotes || ''}
            onChange={(e) => updateFormData({ customerNotes: e.target.value })}
          />
          {errors.customerNotes && <ErrorBox msg={errors.customerNotes} />}
          <p className="text-xs text-muted-foreground">
            Included in Draft Agreement Schedule B. Cannot be blank — enter
            &quot;Nil&quot; if not applicable.
          </p>
        </div>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Governing Law */}
        <div className="space-y-2">
          <Label>
            Governing Law <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.governingLaw || ''}
            onValueChange={(val) => handleSelectChange('governingLaw', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select governing law" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="india">Laws of India</SelectItem>
              <SelectItem value="singapore">Laws of Singapore</SelectItem>
            </SelectContent>
          </Select>
          {errors.governingLaw && <ErrorBox msg={errors.governingLaw} />}
        </div>

        {/* Dispute Resolution */}
        <div className="space-y-2">
          <Label>
            Dispute Resolution <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.disputeResolution || ''}
            onValueChange={(val) =>
              handleSelectChange('disputeResolution', val)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select dispute resolution method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="arbitration">Arbitration</SelectItem>
              <SelectItem value="litigation">Litigation</SelectItem>
              <SelectItem value="mediation">Mediation</SelectItem>
            </SelectContent>
          </Select>
          {errors.disputeResolution && (
            <ErrorBox msg={errors.disputeResolution} />
          )}
        </div>
      </div>

      {/* Delivery / Acceptance */}
      <div className="max-w-[50%] space-y-2 md:max-w-[48%]">
        <Label>
          Delivery / Acceptance Reference{' '}
          <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.deliveryAcceptance || ''}
          onValueChange={(val) => handleSelectChange('deliveryAcceptance', val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select delivery/acceptance terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="milestone">
              Milestone-based acceptance
            </SelectItem>
            <SelectItem value="immediate">Immediate on delivery</SelectItem>
            <SelectItem value="sla">As per SLA</SelectItem>
          </SelectContent>
        </Select>
        {errors.deliveryAcceptance && (
          <ErrorBox msg={errors.deliveryAcceptance} />
        )}
      </div>
    </section>
  );
}
