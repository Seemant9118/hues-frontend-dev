import DocumentUploadStep from '@/components/shared/DocumentUploadStep';
import WorkflowModuleStep from '@/components/shared/WorkflowModuleStep';
import { toast } from 'sonner';
import PurchaseDynamicInvoiceDetail from './layouts/PurchaseDynamicInvoiceDetail';
import PurchaseFinalPreview from './layouts/PurchaseFinalPreview';

export const DynamicPurchaseInvoiceStepsConfig = [
  {
    key: 'invoice-details',
    label: 'Invoice Details',
    component: PurchaseDynamicInvoiceDetail,
    validate: (data) => {
      const errs = {};

      if (!data.source) {
        errs.source = 'Please select a source';
      }
      if (
        data.source !== 'hues' &&
        (!data.invoiceReferenceNumber ||
          data.invoiceReferenceNumber.trim() === '')
      ) {
        errs.invoiceReferenceNumber = 'Reference number is required';
      }
      if (data.sellerId == null && data.sellerEnterpriseId == null) {
        errs.sellerId = 'Please select a vendor';
      }
      if (!data.invoiceType) {
        errs.invoiceType = 'Please select invoice type';
      }

      if (data._formFields) {
        data._formFields.forEach((field) => {
          const skipKeys = [
            'invoiceDate',
            'source',
            'invoiceReferenceNumber',
            'buyerId',
            'invoiceType',
            'productId',
            'batch',
            'quantity',
            'unitPrice',
            'gstPerUnit',
            'totalAmount',
            'totalGstAmount',
            'expiryDate',
          ];
          if (skipKeys.includes(field.key)) return;

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
    component: PurchaseFinalPreview,
  },
];

export const getWorkflowEnhancedStepsConfig = (
  baseSteps = DynamicPurchaseInvoiceStepsConfig,
  activeWorkflow = null,
  moduleName = 'INVOICE',
  evaluatedStepsMap = null,
) => {
  const hasActiveWorkflow =
    activeWorkflow?.source === 'NO_CODE_WORKFLOW' && activeWorkflow?.runtime;

  if (!hasActiveWorkflow) {
    return baseSteps;
  }

  const runtimeSteps = activeWorkflow.runtime?.steps || [];
  const runtimeTransitions = activeWorkflow.runtime?.transitions || [];

  const hasTransitionsWithCondition = runtimeTransitions.some((tr) =>
    Boolean(tr.condition && tr.condition.path),
  );

  const systemStepIndex = runtimeSteps.findIndex(
    (st) => st.start || st.type === 'SYSTEM',
  );

  const interactiveSteps = runtimeSteps.filter((st) => {
    if (st.start || st.type === 'SYSTEM' || st.type === 'END') return false;

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
