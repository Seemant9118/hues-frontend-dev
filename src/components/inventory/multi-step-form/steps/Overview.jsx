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
import React from 'react';

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

const deliveryModuleOptions = [
  { value: 'ON_SITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'AT_PROVIDER_LOCATION', label: 'At Provider Location' },
  { value: 'DIGITAL_DELIVERY', label: 'Digital Delivery' },
];

const unitOptions = [
  { value: 'PER_HOUR', label: 'Per Hour' },
  { value: 'PER_SESSION', label: 'Per Session' },
  { value: 'PER_VISIT', label: 'Per Visit' },
  { value: 'PER_CASE', label: 'Per Case' },
  { value: 'PER_REPORT', label: 'Per Report' },
  { value: 'PER_DEVICE', label: 'Per Device' },
  { value: 'PER_PARTICIPANT', label: 'Per Participant' },
  { value: 'PER_MONTH', label: 'Per Month' },
  { value: 'PER_YEAR', label: 'Per Year' },
  { value: 'PER_PROJECT', label: 'Per Project' },
];

export default function Overview({
  formData,
  setFormData,
  errors,
  translation,
}) {
  const handleChange = (key) => (e) => {
    const value = e && e.target ? e.target.value : e;

    const updates = { [key]: value };

    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="mt-2 flex flex-col gap-4">
      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section1.title')}
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
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
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
            Delivery Module <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.deliveryMode}
            onValueChange={(v) => handleChange('deliveryMode')(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Delivery Module" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {deliveryModuleOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.deliveryMode && <ErrorBox msg={errors?.deliveryMode} />}
        </div>
      </div>

      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section2.title')}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>
            Unit of Measure <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData?.unitOfMeasure}
            onValueChange={(v) => handleChange('unitOfMeasure')(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {unitOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors?.unitOfMeasure && <ErrorBox msg={errors?.unitOfMeasure} />}
        </div>

        <div>
          <Label>Default Duration</Label>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                placeholder="Hours"
                value={formData?.hours}
                onChange={(e) => handleChange('hours')(e)}
              />
              {errors?.hours && <ErrorBox msg={errors?.hours} />}
            </div>
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                placeholder="Minutes"
                value={formData?.minutes}
                onChange={(e) => handleChange('minutes')(e)}
              />
              {errors?.minutes && <ErrorBox msg={errors?.minutes} />}
            </div>
          </div>
        </div>

        <div>
          <Label>Default Capacity Rule</Label>
          <Input
            placeholder="eg. Max 20 participant per batch"
            value={formData?.defaultCapacityRule}
            onChange={(e) => handleChange('defaultCapacityRule')(e)}
          />
        </div>
      </div>

      <h2 className="text-sm font-bold text-primary">
        {translation('multiStepForm.overview.section3.title')}
      </h2>
      <div>
        <div>
          <Label>Tags</Label>
          <Input
            placeholder="Add tags.."
            value={formData?.tags}
            onChange={(e) => handleChange('tags')(e)}
          />
        </div>
      </div>
    </div>
  );
}
