import React from 'react';
import DynamicServiceStep from '../shared/DynamicServiceStep';

export default function Pricing({
  formData,
  setFormData,
  errors,
  translation,
  configFields,
  isConfigLoading,
}) {
  return (
    <DynamicServiceStep
      stepKey="pricing"
      sectionTitle="Base Pricing"
      translationKey="multiStepForm.pricing.section1.title"
      configFields={configFields}
      isConfigLoading={isConfigLoading}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      translation={translation}
    />
  );
}
