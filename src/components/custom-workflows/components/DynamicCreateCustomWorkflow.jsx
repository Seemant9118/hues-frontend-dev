'use client';

import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import React from 'react';
import { useDynamicCustomWorkflowCreate } from '../hooks/useDynamicCustomWorkflowCreate';

export default function DynamicCreateCustomWorkflow({
  definition,
  definitionId,
  onCancel,
  onSuccess,
}) {
  const {
    activeDefinition,
    isFetchingDef,
    formData,
    setFormData,
    errors,
    setErrors,
    stepsConfig,
    isSubmitting,
    handleBeforeNext,
    handleSubmit,
    breadcrumbs,
  } = useDynamicCustomWorkflowCreate({
    definition,
    definitionId,
    onSuccess,
  });

  if (!activeDefinition || isFetchingDef || stepsConfig.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loading />
      </div>
    );
  }

  const moduleName = activeDefinition?.name || 'Workflow';

  return (
    <div className="h-full">
      <MultiStepForm
        steps={stepsConfig}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onBeforeNext={handleBeforeNext}
        isSubmitting={isSubmitting}
        breadcrumbs={breadcrumbs}
        breadcrumbHome={`/dashboard/custom-workflows/${definitionId}`}
        breadcrumbHomeText={moduleName}
        breadcrumbTitle={`Create ${moduleName}`}
        finalStepActions={({ handleFinalSubmit, isSubmitting: isSub }) => (
          <Button
            size="sm"
            onClick={() => handleFinalSubmit('submit')}
            disabled={isSub || isSubmitting}
          >
            {isSub || isSubmitting ? 'Saving...' : `✓ Save ${moduleName}`}
          </Button>
        )}
      />
    </div>
  );
}
