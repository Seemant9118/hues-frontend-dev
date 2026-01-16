import React from 'react';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const pricingModels = [
  { value: 'FIXED', label: 'Fixed' },
  { value: 'HOURLY', label: 'Hourly' },
  { value: 'TIERED', label: 'Tiered' },
  { value: 'UNIT', label: 'Per Unit' },
  { value: 'SUBSCRIPTION', label: 'Subscription' },
];

const currencyOptions = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
];

// Updated GST rates
const gstRates = [
  {
    taxClass: 'GST_18',
    gstPercentage: 18,
    label: '18% - Professional Services',
  },
  { taxClass: 'GST_12', gstPercentage: 12, label: '12% - Maintenance' },
  { taxClass: 'GST_5', gstPercentage: 5, label: '5% - Transport' },
  { taxClass: 'GST_0', gstPercentage: 0, label: '0% - Exempt' },
];

export default function Pricing({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const handleChange = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle GST selection
  const handleGstChange = (selectedTaxClass) => {
    const selected = gstRates.find((o) => o.taxClass === selectedTaxClass);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        gstPercentage: Number(selected.gstPercentage),
        taxClass: selected.taxClass,
      }));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ------------- BASE PRICING ------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.pricing.section1.title') || 'Base Pricing'}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Base Price */}
        <div className="flex gap-2">
          <div className="w-24">
            <Label>
              Base Price <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData?.currency || 'INR'}
              onValueChange={(v) => handleChange('currency')(v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="INR" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {currencyOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>&nbsp;</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={formData?.basePrice || ''}
              onChange={(e) => handleChange('basePrice')(e)}
            />
            {errors?.basePrice && <ErrorBox msg={errors?.basePrice} />}
          </div>
        </div>

        {/* Pricing Model */}
        <div>
          <Label>
            Pricing Model <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.pricingModel || ''}
            onValueChange={(v) => handleChange('pricingModel')(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {pricingModels.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.pricingModel && <ErrorBox msg={errors?.pricingModel} />}
        </div>
      </div>

      {/* ------------- TAX INFORMATION ------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.pricing.section2.title') ||
          'Tax Information'}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Tax Class / GST */}
        <div>
          <Label>
            Tax Class / GST Rate <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.taxClass || ''}
            onValueChange={handleGstChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tax rate" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {gstRates.map((o) => (
                  <SelectItem key={o.taxClass} value={o.taxClass}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.gstPercentage && <ErrorBox msg={errors?.gstPercentage} />}
          {errors?.taxClass && <ErrorBox msg={errors?.taxClass} />}
        </div>

        {/* SAC / HSN Code */}
        <div>
          <Label>
            SAC/HSN Code <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="e.g. 998314"
            value={formData?.sacCode || ''}
            onChange={(e) => handleChange('sacCode')(e)}
          />
          {errors?.sacCode && <ErrorBox msg={errors?.sacCode} />}
        </div>
      </div>
    </div>
  );
}
