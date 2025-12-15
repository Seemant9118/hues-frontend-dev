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
import { Textarea } from '@/components/ui/textarea';
import React from 'react';

const offerTypeOptions = [
  { value: 'BUY_X_GET_Y_FREE', label: 'Buy X Get Y Free' },
  { value: 'BONUS_PACK', label: 'Bonus Pack' },
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'BUNDLE_OFFER', label: 'Bundle Offer' },
];

export default function TradePromotions({
  formData,
  setFormData,
  translation,
}) {
  // format YYYY-MM-DD → DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  // update offers[0]
  const handleChange = (key) => (value) => {
    setFormData((prev) => {
      const offers = Array.isArray(prev.offers) ? [...prev.offers] : [{}];

      offers[0] = {
        ...offers[0],
        [key]: value,
      };

      return {
        ...prev,
        offers,
      };
    });
  };

  const offer = formData?.offers?.[0] || {};

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.tradePromotions.section1.title')}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Offer Type */}
        <div>
          <Label>Offer Type</Label>
          <Select
            value={offer.offerType || ''}
            onValueChange={(v) => handleChange('offerType')(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Offer Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {offerTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Minimum Quantity */}
        <div>
          <Label>Min Quantity to buy</Label>
          <Input
            type="number"
            placeholder="eg. 5"
            value={offer.minimumQuantity ?? ''}
            onChange={(e) => handleChange('minimumQuantity')(e.target.value)}
          />
        </div>

        {/* Bonus Quantity */}
        <div>
          <Label>Bonus Quantity</Label>
          <Input
            type="number"
            placeholder="eg. 1"
            value={offer.bonusQuantity ?? ''}
            onChange={(e) => handleChange('bonusQuantity')(e.target.value)}
          />
        </div>

        {/* Offer Start Date */}
        <div>
          <Label>Offer Start Date</Label>
          <Input
            type="date"
            value={
              offer.offerStartDate
                ? offer.offerStartDate.split('/').reverse().join('-')
                : ''
            }
            onChange={(e) =>
              handleChange('offerStartDate')(formatDate(e.target.value))
            }
          />
        </div>

        {/* Offer End Date */}
        <div>
          <Label>Offer End Date</Label>
          <Input
            type="date"
            value={
              offer.offerEndDate
                ? offer.offerEndDate.split('/').reverse().join('-')
                : ''
            }
            onChange={(e) =>
              handleChange('offerEndDate')(formatDate(e.target.value))
            }
          />
        </div>

        {/* Terms */}
        <div className="col-span-3">
          <Label>Terms and Conditions</Label>
          <Textarea
            rows={4}
            placeholder="Enter Terms and Conditions for the offer"
            value={offer.termsConditions || ''}
            onChange={(e) => handleChange('termsConditions')(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
