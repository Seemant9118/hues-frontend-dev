import React from 'react';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function SLAAndWarranty({
  formData,
  setFormData,
  errors,
  translation,
}) {
  // Handle level-1 keys inside slaConfig
  const handleSLAChange = (key) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      slaConfig: {
        ...prev.slaConfig,
        [key]: value,
      },
    }));
  };

  // Handle revisionPolicy nested values
  const handleRevisionChange = (key) => (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      slaConfig: {
        ...prev.slaConfig,
        revisionPolicy: {
          ...prev.slaConfig?.revisionPolicy,
          [key]: value,
        },
      },
    }));
  };

  // Handle warranty nested values
  const handleWarrantyChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      slaConfig: {
        ...prev.slaConfig,
        warranty: {
          ...prev.slaConfig?.warranty,
          description: value,
        },
      },
    }));
  };

  return (
    <div className="lex flex-col gap-6">
      {/* --------------------------- SERVICE LEVEL AGREEMENT --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.sla.section1.title') ||
          'Service Level Agreement'}
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Standard SLA */}
        <div>
          <Label>
            Standard SLA <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="e.g., Complete within 5 working days"
            value={formData?.slaConfig?.standardSLA || ''}
            onChange={handleSLAChange('standardSLA')}
          />
          {errors?.standardSLA && <ErrorBox msg={errors.standardSLA} />}
        </div>

        {/* Response Time SLA */}
        <div>
          <Label>Response Time SLA</Label>
          <Input
            placeholder="e.g., Initial response within 24 hours"
            value={formData?.slaConfig?.responseTimeSLA || ''}
            onChange={handleSLAChange('responseTimeSLA')}
          />
          {errors?.responseTimeSLA && <ErrorBox msg={errors.responseTimeSLA} />}
        </div>
      </div>

      {/* --------------------------- REVISION & WARRANTY --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.sla.section2.title') ||
          'Revision & Warranty'}
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {/* Number of revisions */}
        <div>
          <Label>Number of Revisions Included</Label>
          <Input
            type="number"
            placeholder="e.g., 2"
            value={formData?.slaConfig?.revisionPolicy?.numberOfRevisions || ''}
            onChange={handleRevisionChange('numberOfRevisions')}
          />
          {errors?.numberOfRevisions && (
            <ErrorBox msg={errors.numberOfRevisions} />
          )}
        </div>

        {/* Revision window */}
        <div>
          <Label>Revision Window (Days)</Label>
          <Input
            type="number"
            placeholder="e.g., 7"
            value={
              formData?.slaConfig?.revisionPolicy?.revisionWindowDays || ''
            }
            onChange={handleRevisionChange('revisionWindowDays')}
          />
          {errors?.revisionWindowDays && (
            <ErrorBox msg={errors.revisionWindowDays} />
          )}
        </div>

        {/* Warranty */}
        <div>
          <Label>Warranty / Guarantee</Label>
          <Textarea
            placeholder="e.g., 30 day bug-fix warranty"
            className="min-h-[90px]"
            value={formData?.slaConfig?.warranty?.description || ''}
            onChange={handleWarrantyChange}
          />
          {errors?.warrantyDescription && (
            <ErrorBox msg={errors.warrantyDescription} />
          )}
        </div>
      </div>

      {/* --------------------------- PENALTY & CREDITS --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.sla.section3.title') || 'Penalty & Credits'}
      </h2>

      <div>
        <Label>Penalty / Credit Logic</Label>
        <Textarea
          placeholder="e.g., 10% credit if SLA breached"
          className="min-h-[90px]"
          value={formData?.slaConfig?.penaltyLogic || ''}
          onChange={handleSLAChange('penaltyLogic')}
        />
        {errors?.penaltyLogic && <ErrorBox msg={errors.penaltyLogic} />}
      </div>
    </div>
  );
}
