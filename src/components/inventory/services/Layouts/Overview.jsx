import FieldRenderer from '@/components/DynamicForm/FieldRenderer';
import FieldToggler from '@/components/fieldToggler/FieldToggler';
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
import React, { useEffect, useState } from 'react';

const serviceCategoryOptions = [
  { value: 'COMPLIANCE', label: 'Compliance' },
  { value: 'CLEANING', label: 'Cleaning' },
  { value: 'MAINTENANCE', label: 'Maintaining' },
  { value: 'CONSULTING', label: 'Consulting' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'IT_SUPPORT', label: 'IT Support' },
  { value: 'LEGAL', label: 'Legal' },
  { value: 'FINANCIAL', label: 'Financial' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'HR', label: 'HR' },
  { value: 'CUSTOM', label: 'Custorm' },
];

export const formSections = [
  /* ================= Delivery Mode ================= */
  {
    key: 'deliveryMode',
    label: 'Delivery Mode',
    description: 'Training delivery method',
    enabledByDefault: true,
    fields: [
      {
        type: 'select',
        name: 'delivery_mode',
        label: 'Delivery Mode',
        options: [
          { label: 'On-site', value: 'ONSITE' },
          { label: 'Remote', value: 'REMOTE' },
          { label: 'Hybrid', value: 'HYBRID' },
        ],
        defaultValue: 'ONSITE',
      },
    ],
  },

  /* ================= Unit of Measure ================= */
  {
    key: 'unitOfMeasure',
    label: 'Unit of Measure',
    description: 'How training is billed',
    enabledByDefault: true,
    fields: [
      {
        type: 'select',
        name: 'unit',
        label: 'Unit',
        options: [
          { label: 'Per Session', value: 'PER_SESSION' },
          { label: 'Per Day', value: 'PER_DAY' },
          { label: 'Per Participant', value: 'PER_PARTICIPANT' },
          { label: 'Per Program', value: 'PER_PROGRAM' },
        ],
        defaultValue: 'PER_SESSION',
      },
    ],
  },

  /* ================= Training Topic (Multi-select) ================= */
  {
    key: 'trainingTopic',
    label: 'Training Topic',
    description: 'Subject areas covered',
    enabledByDefault: true,
    fields: [
      {
        type: 'select',
        name: 'training_topics',
        label: 'Training Topic',
        options: [
          { label: 'Leadership', value: 'LEADERSHIP' },
          { label: 'Sales', value: 'SALES' },
          { label: 'Communication', value: 'COMMUNICATION' },
          { label: 'Technical Skills', value: 'TECHNICAL_SKILLS' },
          { label: 'Compliance', value: 'COMPLIANCE' },
          { label: 'Safety', value: 'SAFETY' },
          { label: 'Soft Skills', value: 'SOFT_SKILLS' },
        ],
        defaultValue: 'LEADERSHIP',
      },
    ],
  },

  /* ================= Max Participants ================= */
  {
    key: 'maxParticipants',
    label: 'Max Participants per Batch',
    description: 'Capacity constraint per session',
    enabledByDefault: true,
    fields: [
      {
        type: 'number',
        name: 'max_participants',
        label: 'Max Participants',
        defaultValue: 25,
      },
    ],
  },

  /* ================= Default Duration ================= */
  {
    key: 'defaultDuration',
    label: 'Default Duration (Hours)',
    description: 'Standard session duration',
    enabledByDefault: true,
    fields: [
      {
        type: 'number',
        name: 'default_duration_hours',
        label: 'Default Duration (Hours)',
        defaultValue: 4,
      },
    ],
  },
];

export default function Overview({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const [enabledSections, setEnabledSections] = useState(() =>
    Object.fromEntries(formSections.map((s) => [s.key, s.enabledByDefault])),
  );

  useEffect(() => {
    formSections.forEach((section) => {
      if (!enabledSections[section.key]) return;

      section.fields.forEach((field) => {
        if (formData[field.name] == null && field.defaultValue !== undefined) {
          setFormData((prev) => ({
            ...prev,
            [field.name]: field.defaultValue,
          }));
        }
      });
    });
  }, [enabledSections, formSections]);

  const toggleSection = (key, value) => {
    setEnabledSections((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;

    const updates = { [key]: value };

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* user entererd manually */}
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section1.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Service Name <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="Service name"
            value={formData?.serviceName}
            onChange={(e) => handleChange('serviceName')(e)}
          />
          {errors?.serviceName && <ErrorBox msg={errors?.serviceName} />}
        </div>

        <div>
          <Label>
            Service Code (SKU ID) <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="Service code"
            value={formData?.serviceCode}
            onChange={(e) => handleChange('serviceCode')(e)}
          />
          {errors?.serviceCode && <ErrorBox msg={errors?.serviceCode} />}
        </div>
      </div>

      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section2.title')}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>
            Service Category <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.serviceCategory}
            onValueChange={(v) => handleChange('serviceCategory')(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="eg. Compliance, IT Consultancy etc" />
            </SelectTrigger>
            <SelectContent className="max-h-52">
              <SelectGroup>
                {serviceCategoryOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.serviceCategory && (
            <ErrorBox msg={errors?.serviceCategory} />
          )}
        </div>

        <div>
          <Label>Service Sub type</Label>
          <Input
            placeholder="e.g. Return filling, Deep Cleaning"
            value={formData?.serviceSubType}
            onChange={(e) => handleChange('serviceSubType')(e)}
          />
        </div>
      </div>

      {/* default fields selection */}
      <h2 className="text-sm font-bold text-primary">
        Default value (pre-selected during offer creation)
      </h2>
      <div className="space-y-2">
        {formSections.map((section) => (
          <FieldToggler
            key={section.key}
            section={section}
            enabled={enabledSections[section.key]}
            onToggle={(val) => toggleSection(section.key, val)}
            renderFields={(fields, isDisabled) =>
              fields.map((field) => (
                <FieldRenderer
                  key={field.name}
                  field={{
                    ...field,
                    disabled: isDisabled || field.disabled,
                  }}
                  value={formData[field.name]}
                  onChange={handleChange}
                  error={errors[field.name]}
                  formData={formData}
                />
              ))
            }
          />
        ))}
      </div>
    </div>
  );
}
