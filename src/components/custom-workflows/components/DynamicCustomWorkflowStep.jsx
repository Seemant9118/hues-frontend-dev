'use client';

import DocumentUploadStep from '@/components/shared/DocumentUploadStep';
import WorkflowFormFieldsRenderer from '@/components/shared/components/WorkflowFormFieldsRenderer';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Network } from 'lucide-react';
import React from 'react';

export default function DynamicCustomWorkflowStep({
  stepData,
  formData = {},
  setFormData,
  errors = {},
  setErrors,
}) {
  const stepKey = stepData?.key || '';
  const currentStepValues = formData?.workflowStepValues?.[stepKey] || {};

  const handleStepValueChange = (targetKey, field, value) => {
    if (errors && (errors[field] || errors[`${targetKey}.${field}`])) {
      setErrors?.((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        delete next[field];
        delete next[`${targetKey}.${field}`];
        return next;
      });
    }

    setFormData?.((prev) => ({
      ...prev,
      [field]: value,
      customFields: {
        ...(prev?.customFields || {}),
        [field]: value,
      },
      workflowStepValues: {
        ...(prev?.workflowStepValues || {}),
        [targetKey]: {
          ...(prev?.workflowStepValues?.[targetKey] || {}),
          [field]: value,
        },
      },
    }));
  };

  const formFields =
    stepData?.formConfiguration?.fields ||
    stepData?.formConfig?.fields ||
    stepData?.fields ||
    [];

  // If DOCUMENT_UPLOAD step, render DocumentUploadStep directly as in order creation
  if (stepData?.type === 'DOCUMENT_UPLOAD') {
    return (
      <DocumentUploadStep
        formData={formData}
        setFormData={setFormData}
        stepKey={stepKey}
        stepData={stepData}
        errors={errors}
        setErrors={setErrors}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* APPROVAL Step UI */}
      {stepData.type === 'APPROVAL' && (
        <Card className="space-y-3 border bg-white p-4">
          <div className="rounded-md border bg-blue-50/50 p-3 text-xs text-blue-900">
            <p>
              <strong>Approval Target:</strong> Role (
              {stepData.assignee?.roleCode ||
                (stepData.assignee?.roleId
                  ? `Role #${stepData.assignee.roleId}`
                  : 'Manager')}
              )
            </p>
            <p className="mt-1 text-[11px] text-blue-700">
              This approval step will be assigned to the designated reviewer
              upon submission.
            </p>
          </div>

          <div>
            <Label className="text-xs font-semibold">
              Approval Remarks / Pre-Approval Note
            </Label>
            <Textarea
              rows={3}
              className="mt-1 bg-white text-xs"
              placeholder="Enter optional remarks or approval context..."
              value={currentStepValues.remarks || ''}
              onChange={(e) =>
                handleStepValueChange(stepKey, 'remarks', e.target.value)
              }
            />
          </div>
        </Card>
      )}

      {/* FORM Step UI */}
      {stepData.type === 'FORM' && (
        <div className="p-2">
          <WorkflowFormFieldsRenderer
            formFields={formFields}
            currentStepValues={currentStepValues}
            formData={formData}
            errors={errors}
            targetStepKey={stepKey}
            onStepValueChange={handleStepValueChange}
          />
        </div>
      )}

      {/* Fallback for other step types */}
      {!['FORM', 'APPROVAL'].includes(stepData.type) && (
        <Card className="flex items-center gap-2 border bg-gray-50 p-4 text-xs text-gray-700">
          <Network className="h-4 w-4 text-gray-400" />
          <span>
            Step <strong className="font-mono">{stepData.key}</strong> is
            automated by the workflow engine.
          </span>
        </Card>
      )}
    </div>
  );
}
