import React from 'react';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Description({
  formData,
  setFormData,
  errors,
  translation,
}) {
  // Generic change handler
  const handleChange = (key, nestedKey) => (e) => {
    const value = e?.target ? e.target.value : e;

    if (nestedKey) {
      setFormData((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [nestedKey]: value.split('\n'), // Convert textarea to array
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-6">
      {/* --------------------------- SERVICE DESCRIPTION --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.description.section1.title') ||
          'Service Description'}
      </h2>

      {/* Short Description */}
      <div>
        <Label>
          Short Description <span className="text-red-600">*</span>
        </Label>
        <Input
          placeholder="Brief description for listings and invoices"
          value={formData?.shortDescription || ''}
          onChange={handleChange('shortDescription')}
        />
        {errors?.shortDescription && <ErrorBox msg={errors.shortDescription} />}
      </div>

      {/* Long Description */}
      <div>
        <Label>Long Description</Label>
        <Textarea
          placeholder="Detailed service description..."
          value={formData?.longDescription || ''}
          onChange={handleChange('longDescription')}
          className="min-h-[120px]"
        />
        {errors?.longDescription && <ErrorBox msg={errors.longDescription} />}
      </div>

      {/* --------------------------- INCLUSIONS & EXCLUSIONS --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.description.section2.title') ||
          'Inclusions & Exclusions'}
      </h2>

      {/* What's Included */}
      <div>
        <Label>{`What's Included`}</Label>
        <Textarea
          placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
          value={formData?.serviceInclusions?.included?.join('\n') || ''}
          onChange={handleChange('serviceInclusions', 'included')}
          className="min-h-[120px]"
        />
        {errors?.serviceInclusions?.included && (
          <ErrorBox msg={errors.serviceInclusions.included} />
        )}
      </div>

      {/* What's Not Included */}
      <div>
        <Label>{`What's Not Included`}</Label>
        <Textarea
          placeholder="• Item 1&#10;• Item 2&#10;• Item 3"
          value={formData?.serviceInclusions?.excluded?.join('\n') || ''}
          onChange={handleChange('serviceInclusions', 'excluded')}
          className="min-h-[120px]"
        />
        {errors?.serviceInclusions?.excluded && (
          <ErrorBox msg={errors.serviceInclusions.excluded} />
        )}
      </div>
    </div>
  );
}
