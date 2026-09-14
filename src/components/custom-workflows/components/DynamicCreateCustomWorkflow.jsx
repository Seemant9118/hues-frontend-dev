'use client';

import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import React from 'react';
import { useDynamicCustomWorkflowCreate } from '@/components/custom-workflows/hooks/useDynamicCustomWorkflowCreate';

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

  if (isFetchingDef) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <Loading />
      </div>
    );
  }

  if (!activeDefinition || stepsConfig.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No workflow form steps found for this definition.
        </p>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Back to Instances
        </Button>
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
