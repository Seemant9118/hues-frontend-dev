import React from 'react';
import DynamicServiceStep from '../shared/DynamicServiceStep';

export default function Description({
  formData,
  setFormData,
  errors,
  translation,
  configFields,
  isConfigLoading,
}) {
  return (
    <DynamicServiceStep
      stepKey="description"
      sectionTitle="Service Description"
      translationKey="multiStepForm.description.section1.title"
      configFields={configFields}
      isConfigLoading={isConfigLoading}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      translation={translation}
    />
  );
}
