import DocumentUploadStep from '@/components/shared/DocumentUploadStep';
import WorkflowModuleStep from '@/components/shared/WorkflowModuleStep';
import BuyerContext from './layouts/BuyerContext';
import PreviewFinalPage from './layouts/PreviewFinalPage';
import ServicesLineItems from './layouts/ServiceLineItems';
import {
  validateBuyerContext,
  validateOfferTerms,
  validateServices,
} from './validator';

export const getSalesServiceFormSteps = ({ cta }) => {
  return [
    {
      key: 'buyer-context',
      label: cta === 'offer' ? 'Client Context' : 'Vendor Context',
      component: BuyerContext,
      validate: validateBuyerContext,
    },
    {
      key: 'services-line-items',
      label: 'Services & Line Items',
      component: ServicesLineItems,
      validate: validateServices,
    },
    {
      key: 'offer-terms-preview',
      label: 'Offer Terms & Preview',
      component: PreviewFinalPage,
      validate: validateOfferTerms,
    },
  ];
};

export const getWorkflowEnhancedServiceStepsConfig = ({
  cta,
  activeWorkflow = null,
  moduleName = 'ORDER',
  evaluatedStepsMap = null,
}) => {
  const baseSteps = getSalesServiceFormSteps({ cta });

  const hasActiveWorkflow =
    activeWorkflow?.source === 'NO_CODE_WORKFLOW' && activeWorkflow?.runtime;

  if (!hasActiveWorkflow) {
    return baseSteps;
  }

  const runtimeSteps = activeWorkflow.runtime?.steps || [];
  const runtimeTransitions = activeWorkflow.runtime?.transitions || [];

  // Check if any transition in the graph has execution conditions
  const hasTransitionsWithCondition = runtimeTransitions.some((tr) =>
    Boolean(tr.condition && tr.condition.path),
  );

  // Find system start node index in runtime steps
  const systemStepIndex = runtimeSteps.findIndex(
    (st) => st.start || st.type === 'SYSTEM',
  );

  // Extract interactive workflow steps (e.g. APPROVAL, FORM, DOCUMENT_UPLOAD, STATUS_UPDATE, NOTIFICATION)
  const interactiveSteps = runtimeSteps.filter((st) => {
    if (st.start || st.type === 'SYSTEM' || st.type === 'END') return false;

    // If transitions have conditions, only include interactive step if dynamically validated/unlocked
    if (hasTransitionsWithCondition) {
      if (!evaluatedStepsMap) return false;
      return Boolean(
        evaluatedStepsMap[st.key] ||
        evaluatedStepsMap[`workflow-${st.key}`] ||
        evaluatedStepsMap[st.type],
      );
    }

    return true;
  });

  if (interactiveSteps.length === 0 && !hasTransitionsWithCondition) {
    return baseSteps;
  }

  const mapToStepConfig = (st) => {
    const customFormName =
      st.formConfiguration?.name || st.formConfig?.name || st.formName;

    const displayLabel = customFormName || st.label || st.name || st.key;

    return {
      key: `workflow-${st.key}`,
      rawKey: st.key,
      stepType: st.type,
      label: displayLabel,
      component: function WorkflowStepWrapper(props) {
        if (st.type === 'DOCUMENT_UPLOAD') {
          return (
            <DocumentUploadStep
              {...props}
              module={moduleName}
              stepKey={st.key}
              stepData={st}
            />
          );
        }
        return (
          <WorkflowModuleStep
            {...props}
            module={moduleName}
            stepKey={st.key}
            stepData={st}
          />
        );
      },
    };
  };

  // Partition interactive steps into before-system and after-system based on their sequence in runtimeSteps
  const beforeSystemSteps = [];
  const afterSystemSteps = [];

  interactiveSteps.forEach((st) => {
    const origIndex = runtimeSteps.indexOf(st);
    if (systemStepIndex !== -1 && origIndex < systemStepIndex) {
      beforeSystemSteps.push(mapToStepConfig(st));
    } else {
      afterSystemSteps.push(mapToStepConfig(st));
    }
  });

  const previewStepKey = 'offer-terms-preview';
  const systemFormSteps = baseSteps.filter((s) => s.key !== previewStepKey);
  const previewStep =
    baseSteps.find((s) => s.key === previewStepKey) ||
    baseSteps[baseSteps.length - 1];

  return [
    ...beforeSystemSteps,
    ...systemFormSteps,
    ...afterSystemSteps,
    ...(previewStep ? [previewStep] : []),
  ];
};
