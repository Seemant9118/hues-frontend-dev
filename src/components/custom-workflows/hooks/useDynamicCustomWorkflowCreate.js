'use client';

import DocumentUploadStep from '@/components/shared/DocumentUploadStep';
import {
  useCustomWorkflowRuntimeDefinition,
  useNextStepPreview,
  useWorkflowRuntimeMutations,
} from '@/hooks/workflows/useWorkflowRuntime';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import CustomWorkflowFinalPreview from '@/components/custom-workflows/components/CustomWorkflowFinalPreview';
import DynamicCustomWorkflowStep from '@/components/custom-workflows/components/DynamicCustomWorkflowStep';
import {
  buildInstanceStartPayload,
  buildNextStepPreviewPayload,
  getDefinitionSteps,
  getDefinitionTransitions,
  validateWorkflowStep,
} from '@/components/custom-workflows/utils/customWorkflowPayloadHelper';

// Stable component caches to avoid remounting inputs on re-render
const stepComponentCache = new Map();
function getCustomStepComponent(st) {
  if (!stepComponentCache.has(st.key)) {
    const StepComponent = function CachedStepWrapper(props) {
      if (st.type === 'DOCUMENT_UPLOAD') {
        return (
          <DocumentUploadStep
            {...props}
            module="CUSTOM_WORKFLOW"
            stepKey={st.key}
            stepData={st}
          />
        );
      }
      return <DynamicCustomWorkflowStep {...props} stepData={st} />;
    };
    StepComponent.displayName = `CustomStep_${st.key}`;
    stepComponentCache.set(st.key, StepComponent);
  }
  return stepComponentCache.get(st.key);
}

const previewComponentCache = new Map();
function getPreviewComponent(definition) {
  const defId = definition?.id || definition?.definitionId || 'default';
  if (!previewComponentCache.has(defId)) {
    const PreviewComponent = function CachedPreviewWrapper(props) {
      return <CustomWorkflowFinalPreview {...props} definition={definition} />;
    };
    PreviewComponent.displayName = `PreviewStep_${defId}`;
    previewComponentCache.set(defId, PreviewComponent);
  }
  return previewComponentCache.get(defId);
}

/**
 * Custom hook encapsulating state, dynamic condition evaluation, step validation,
 * and instance creation mutations for Custom Workflow execution.
 */
export function useDynamicCustomWorkflowCreate({
  definition,
  definitionId,
  onSuccess,
}) {
  const { data: runtimeDef, isLoading: isFetchingDef } =
    useCustomWorkflowRuntimeDefinition(definitionId, {
      enabled: !definition && Boolean(definitionId),
    });

  const activeDefinition = useMemo(() => {
    const base = definition || runtimeDef;
    return base?.definition || base?.data || base;
  }, [definition, runtimeDef]);

  const [formData, setFormData] = useState(() => ({
    workflowStepValues: {},
    customFields: {},
  }));
  const [errors, setErrors] = useState({});
  const [evaluatedStepsMap, setEvaluatedStepsMap] = useState({});

  const nextStepPreviewMutation = useNextStepPreview();
  const { startInstance, isStarting, submitAction, isSubmittingAction } =
    useWorkflowRuntimeMutations();

  const isSubmitting = isStarting || isSubmittingAction;

  const rawSteps = useMemo(() => {
    return getDefinitionSteps(activeDefinition);
  }, [activeDefinition]);

  const rawTransitions = useMemo(() => {
    return getDefinitionTransitions(activeDefinition);
  }, [activeDefinition]);

  const hasTransitionsWithCondition = useMemo(() => {
    return rawTransitions.some((tr) =>
      Boolean(tr.condition && tr.condition.path),
    );
  }, [rawTransitions]);

  const startStep = useMemo(() => {
    return rawSteps.find((st) => st.start) || rawSteps[0];
  }, [rawSteps]);

  // Build the list of active steps based on condition evaluation
  const stepsConfig = useMemo(() => {
    if (!rawSteps || rawSteps.length === 0) return [];

    const activeSteps = rawSteps.filter((st) => {
      // Exclude automatic end steps
      if (
        st.type === 'END' ||
        st.key === 'END' ||
        st.key?.toUpperCase().startsWith('END')
      ) {
        return false;
      }

      // Start step is always visible
      if (st.key === startStep?.key || st.start) {
        return true;
      }

      // If condition is present in transitions, by default hide subsequent steps unless unlocked
      if (hasTransitionsWithCondition) {
        return Boolean(
          evaluatedStepsMap[st.key] ||
          evaluatedStepsMap[`workflow-${st.key}`] ||
          evaluatedStepsMap[st.type],
        );
      }

      return true;
    });

    const mappedSteps = activeSteps.map((st) => ({
      key: `workflow-${st.key}`,
      rawKey: st.key,
      label: st.label || st.key,
      stepType: st.type,
      component: getCustomStepComponent(st),
      validate: (data) => validateWorkflowStep(st, data),
    }));

    // Final preview step
    mappedSteps.push({
      key: 'final-preview',
      label: 'Preview',
      component: getPreviewComponent(activeDefinition),
    });

    return mappedSteps;
  }, [
    rawSteps,
    startStep,
    hasTransitionsWithCondition,
    evaluatedStepsMap,
    activeDefinition,
  ]);

  const handleBeforeNext = async (currentStepIndex, stepConfig) => {
    // If it's the preview step, proceed directly
    if (stepConfig.key === 'final-preview') return true;

    if (!hasTransitionsWithCondition) return true;

    const currentStepKey =
      stepConfig.rawKey || stepConfig.key.replace('workflow-', '');

    // Collect all downstream steps after current step
    const currentIndex = rawSteps.findIndex((st) => st.key === currentStepKey);

    const downstreamKeys = new Set();
    if (currentIndex !== -1) {
      rawSteps.slice(currentIndex + 1).forEach((st) => {
        if (st.key) {
          downstreamKeys.add(st.key);
          downstreamKeys.add(`workflow-${st.key}`);
        }
      });
    }

    rawTransitions.forEach((tr) => {
      if (tr.from === currentStepKey && tr.to) {
        downstreamKeys.add(tr.to);
        downstreamKeys.add(`workflow-${tr.to}`);
      }
    });

    const payload = buildNextStepPreviewPayload({
      definitionId,
      stepKey: currentStepKey,
      formData,
    });

    try {
      const res = await nextStepPreviewMutation.mutateAsync(payload);
      const nextStepData = res?.data?.data;
      const nextKey =
        nextStepData?.nextStepKey ||
        nextStepData?.nextStep?.key ||
        nextStepData?.key;
      const nextType =
        nextStepData?.type ||
        nextStepData?.stepType ||
        nextStepData?.nextStep?.type;

      const isEndStep =
        !nextStepData ||
        !nextKey ||
        nextType === 'END' ||
        nextKey === 'END' ||
        String(nextKey).toUpperCase().startsWith('END');

      if (isEndStep) {
        // Condition evaluated to END or no matching step:
        // Clear all downstream steps so user goes directly to review step
        setEvaluatedStepsMap((prev) => {
          const nextMap = { ...prev };
          downstreamKeys.forEach((k) => {
            delete nextMap[k];
          });
          return nextMap;
        });

        // Clean up downstream form values if any
        setFormData((prev) => {
          const updatedSteps = { ...(prev?.workflowStepValues || {}) };
          let changed = false;
          downstreamKeys.forEach((k) => {
            const raw = k.replace('workflow-', '');
            if (updatedSteps[raw]) {
              delete updatedSteps[raw];
              changed = true;
            }
          });
          return changed ? { ...prev, workflowStepValues: updatedSteps } : prev;
        });
      } else {
        // Condition evaluated to a valid intermediate next step
        setEvaluatedStepsMap((prev) => {
          const nextMap = { ...prev };
          downstreamKeys.forEach((k) => {
            if (k !== nextKey && k !== `workflow-${nextKey}`) {
              delete nextMap[k];
            }
          });
          nextMap[nextKey] = true;
          nextMap[`workflow-${nextKey}`] = true;
          return nextMap;
        });

        const prefillValues =
          nextStepData?.prefillValues ||
          nextStepData?.prefill ||
          nextStepData?.values ||
          {};

        if (Object.keys(prefillValues).length > 0) {
          setFormData((prev) => {
            const updatedCustom = { ...(prev?.customFields || {}) };
            const updatedSteps = { ...(prev?.workflowStepValues || {}) };
            const targetMap = { ...(updatedSteps[nextKey] || {}) };

            Object.entries(prefillValues).forEach(([k, v]) => {
              if (v !== undefined && v !== null && v !== '') {
                updatedCustom[k] = v;
                targetMap[k] = v;
              }
            });

            return {
              ...prev,
              customFields: updatedCustom,
              workflowStepValues: {
                ...updatedSteps,
                [nextKey]: targetMap,
              },
            };
          });
        }
      }
    } catch {
      // Gracefully continue even if preview evaluation encounters a network hiccup
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      const payload = buildInstanceStartPayload({
        definitionId,
        formData,
        definition: activeDefinition,
      });

      const startRes = await startInstance(payload);
      const instanceData = startRes?.data?.data || startRes?.data;
      const createdInstance = instanceData?.instance;
      const currentStepInstance = instanceData?.currentStepInstance;
      const activeStep = instanceData?.currentStep || startStep;

      // If the started instance has a pending form action for the start step, submit it
      if (
        createdInstance?.id &&
        currentStepInstance?.id &&
        activeStep?.type === 'FORM'
      ) {
        const startStepValues =
          payload.context?.forms?.[activeStep.key]?.values ||
          formData?.workflowStepValues?.[activeStep.key] ||
          formData?.customFields ||
          {};

        await submitAction({
          instanceId: createdInstance.id,
          stepInstanceId: currentStepInstance.id,
          payload: {
            action: 'SUBMIT_FORM',
            formConfigurationId: activeStep.formConfigurationId || 1,
            values: startStepValues,
            formConfig: activeStep.formConfiguration || {},
          },
        });
      } else if (
        createdInstance?.id &&
        currentStepInstance?.id &&
        activeStep?.type === 'DOCUMENT_UPLOAD'
      ) {
        const stepVals = formData?.workflowStepValues?.[activeStep.key] || {};
        const attIds = (stepVals.attachments || [])
          .map((a) => a.id)
          .filter((id) => id !== undefined && id !== null);
        const docIds = (stepVals.documentIds || []).filter(
          (id) => id !== undefined && id !== null,
        );

        await submitAction({
          instanceId: createdInstance.id,
          stepInstanceId: currentStepInstance.id,
          payload: {
            action: 'UPLOAD_DOCUMENT',
            attachmentIds: attIds,
            documentIds: docIds,
          },
        });
      }

      toast.success(
        `Successfully created and submitted ${activeDefinition?.name || 'workflow'}!`,
      );
      onSuccess?.();
    } catch {
      // Errors handled via mutation onError
    }
  };

  const breadcrumbs = useMemo(() => {
    const title = activeDefinition?.name || 'Workflow';
    return [
      {
        id: 1,
        name: title,
        path: `/dashboard/custom-workflows/${definitionId}`,
        show: true,
      },
      {
        id: 2,
        name: `Create ${title}`,
        path: `/dashboard/custom-workflows/${definitionId}?create`,
        show: true,
      },
    ];
  }, [activeDefinition?.name, definitionId]);

  return {
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
  };
}
