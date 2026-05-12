import React from 'react';
import DynamicServiceStep from '../shared/DynamicServiceStep';

export default function Operations({
  formData,
  setFormData,
  errors,
  translation,
  configFields,
  isConfigLoading,
}) {
  return (
    <DynamicServiceStep
      stepKey="operations"
      sectionTitle="Resource Requirements"
      translationKey="multiStepForm.operations.section1.title"
      configFields={configFields}
      isConfigLoading={isConfigLoading}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      translation={translation}
    />
  );
}
