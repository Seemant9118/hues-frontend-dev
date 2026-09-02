import DocumentUploadStep from '@/components/shared/DocumentUploadStep';
import WorkflowModuleStep from '@/components/shared/WorkflowModuleStep';
import { toast } from 'sonner';
import DynamicGoodsDetail from './layouts/DynamicGoodsDetail';
import FinalPreview from './layouts/FinalPreview';

export const DynamicGoodsOrderStepsConfig = [
  {
    key: 'goods-details',
    label: 'Goods Details',
    component: DynamicGoodsDetail,
    validate: (data) => {
      const errs = {};
      if (data.cta === 'offer') {
        if (data.clientType === 'B2B' && data.buyerId == null)
          errs.buyerId = 'Please select a Client/Customer';
        if (data.clientType === 'B2C' && data.buyerId == null)
          errs.buyerId = 'Please select a Customer';
      } else if (data.sellerEnterpriseId == null)
        errs.sellerEnterpriseId = 'Please select a Vendor';

      // Validate required dynamic config fields and custom fields
      if (data._formFields) {
        data._formFields.forEach((field) => {
          if (field.key === 'buyerId' || field.key === 'sellerEnterpriseId')
            return;

          const itemKeys = [
            'productId',
            'quantity',
            'unitId',
            'unitPrice',
            'gstPerUnit',
            'totalAmount',
            'totalGstAmount',
            'finalAmount',
          ];
          if (itemKeys.includes(field.key)) return;

          // Only validate fields of kind CUSTOM (since system fields are validated explicitly)
          if (field.kind !== 'CUSTOM') return;

          if (field.required && field.visible) {
            const val =
              data[field.key] !== undefined
                ? data[field.key]
                : data.customFields?.[field.key] !== undefined
                  ? data.customFields?.[field.key]
                  : data.extraInfo?.[field.key];
            if (val === undefined || val === null || val === '') {
              errs[field.key] = `${field.label} is required`;
            }
          }
        });
      }

      if (!data.orderItems || data.orderItems.length === 0) {
        errs.orderItem = 'Please select at least 1 item';
        toast.error('Please add an item to proceed.');
      }
      return errs;
    },
  },
  {
    key: 'preview-final',
    label: 'Preview',
    component: FinalPreview,
  },
];

export const getWorkflowEnhancedStepsConfig = (
  baseSteps = DynamicGoodsOrderStepsConfig,
  activeWorkflow = null,
  moduleName = 'ORDER',
  evaluatedStepsMap = null,
) => {
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

  const systemFormSteps = baseSteps.filter((s) => s.key !== 'preview-final');
  const previewStep =
    baseSteps.find((s) => s.key === 'preview-final') ||
    baseSteps[baseSteps.length - 1];

  return [
    ...beforeSystemSteps,
    ...systemFormSteps,
    ...afterSystemSteps,
    ...(previewStep ? [previewStep] : []),
  ];
};
