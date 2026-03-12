import React from 'react';
import DynamicServiceStep from '../shared/DynamicServiceStep';

const AddOns = ({
  formData,
  setFormData,
  errors,
  translation,
  configFields,
  isConfigLoading,
}) => {
  return (
    <DynamicServiceStep
      stepKey="addOns"
      sectionTitle="Add-on Services"
      translationKey="multiStepForm.addOns.section1.title"
      configFields={configFields}
      isConfigLoading={isConfigLoading}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      translation={translation}
    />
  );
};

export default AddOns;
