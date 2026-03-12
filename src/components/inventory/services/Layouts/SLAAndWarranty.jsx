import React from 'react';
import DynamicServiceStep from '../shared/DynamicServiceStep';

export default function SLAAndWarranty({
  formData,
  setFormData,
  errors,
  translation,
  configFields,
  isConfigLoading,
}) {
  return (
    <DynamicServiceStep
      stepKey="SLAAndWarranty"
      sectionTitle="Service Level Agreement"
      translationKey="multiStepForm.sla.section1.title"
      configFields={configFields}
      isConfigLoading={isConfigLoading}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      translation={translation}
    />
  );
}
