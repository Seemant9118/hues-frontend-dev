import React from 'react';
import DynamicServiceStep from '../shared/DynamicServiceStep';

export default function ContractsAndConsents({
  formData,
  setFormData,
  errors,
  translation,
  configFields,
  isConfigLoading,
}) {
  return (
    <DynamicServiceStep
      stepKey="contracts"
      sectionTitle="Service Agreement"
      translationKey="multiStepForm.contracts.section1.title"
      configFields={configFields}
      isConfigLoading={isConfigLoading}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      translation={translation}
    />
  );
}
