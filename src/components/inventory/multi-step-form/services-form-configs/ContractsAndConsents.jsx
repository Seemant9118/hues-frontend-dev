import React, { useState } from 'react';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

const serviceAgreementOptions = [
  { value: 'SSA', label: 'Standard Service Agreement' },
  { value: 'PSA', label: 'Professional Services Agreement' },
  { value: 'CA', label: 'Consulting Agreement' },
  { value: 'MA', label: 'Maintenance Agreement' },
];

export default function ContractsAndConsents({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [newConsent, setNewConsent] = useState('');

  const handleChange = (key, nestedKey) => (value) => {
    if (nestedKey) {
      setFormData((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          [nestedKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const addConsent = () => {
    if (!newConsent.trim()) return;
    setFormData((prev) => ({
      ...prev,
      contractsConfig: {
        ...prev.contractsConfig,
        requiredConsents: [
          ...(prev.contractsConfig?.requiredConsents || []),
          newConsent.trim(),
        ],
      },
    }));
    setNewConsent('');
  };

  const removeConsent = (index) => {
    setFormData((prev) => ({
      ...prev,
      contractsConfig: {
        ...prev.contractsConfig,
        requiredConsents: prev.contractsConfig.requiredConsents.filter(
          (_, i) => i !== index,
        ),
      },
    }));
  };

  return (
    <div className="mt-2 flex flex-col gap-6">
      {/* --------------------------- SERVICE AGREEMENT --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.contracts.section1.title') ||
          'Service Agreement'}
      </h2>

      <div>
        <Label>Default Service Agreement Template</Label>
        <Select
          value={
            formData?.contractsConfig?.defaultServiceAgreementTemplate || ''
          }
          onValueChange={(v) =>
            handleChange(
              'contractsConfig',
              'defaultServiceAgreementTemplate',
            )(v)
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            {serviceAgreementOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.contractsConfig?.defaultServiceAgreementTemplate && (
          <ErrorBox
            msg={errors.contractsConfig.defaultServiceAgreementTemplate}
          />
        )}
      </div>

      {/* --------------------------- REQUIRED CONSENTS --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.contracts.section2.title') ||
          'Required Consents'}
      </h2>

      <div className="mb-2 flex gap-2">
        <Input
          placeholder="Add consent requirement..."
          value={newConsent}
          onChange={(e) => setNewConsent(e.target.value)}
        />
        <Button size="sm" onClick={addConsent}>
          Add
        </Button>
      </div>

      {/* Display added consents */}
      <div className="flex flex-col gap-1">
        {formData?.contractsConfig?.requiredConsents?.map((consent, index) => (
          <div
            key={consent}
            className="flex items-center justify-between rounded border p-2"
          >
            <span>{consent}</span>
            <button
              type="button"
              className="text-red-500 hover:text-red-600"
              onClick={() => removeConsent(index)}
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
      {errors?.contractsConfig?.requiredConsents && (
        <ErrorBox msg={errors.contractsConfig.requiredConsents} />
      )}

      {/* --------------------------- COMPLIANCE --------------------------- */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.contracts.section3.title') || 'Compliance'}
      </h2>

      <div>
        <Label>Compliance Notes</Label>
        <Textarea
          placeholder="e.g., Requires NDA signed, DPDP consent captured at onboarding"
          value={formData?.contractsConfig?.complianceNotes || ''}
          onChange={(e) =>
            handleChange('contractsConfig', 'complianceNotes')(e.target.value)
          }
          className="min-h-[120px]"
        />
        {errors?.contractsConfig?.complianceNotes && (
          <ErrorBox msg={errors.contractsConfig.complianceNotes} />
        )}
      </div>
    </div>
  );
}
