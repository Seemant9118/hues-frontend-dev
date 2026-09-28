'use client';

import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import InvoiceTypePopover from '@/components/invoices/InvoiceTypePopover';
import {
  useActiveWorkflowRuntime,
  useNextStepPreview,
} from '@/hooks/workflows/useWorkflowRuntime';
import { SessionStorageService } from '@/lib/utils';
import {
  extractConditionFormData,
  extractConditionRecordData,
  getConditionPathsFromTransitions,
} from '@/utils/workflowConditionHelper';

import MultiStepForm from '@/components/shared/MultiStepForm/MultiStepForm';
import {
  DynamicB2CInvoiceStepsConfig,
  getWorkflowEnhancedStepsConfig,
} from './DynamicCreate_Invoice_B2C';
import { useB2CInvoiceActions } from './hooks/useB2CInvoiceActions';

const INVOICE_CONFIG = {
  breadcrumbs: [
    {
      id: 1,
      name: 'Sales',
      path: '/dashboard/sales/sales-invoices',
      show: true,
    },
    { id: 2, name: 'Create B2C Invoice', path: '#', show: true },
  ],
  homePath: '/dashboard/sales/sales-invoices',
  homeText: 'Sales Invoices',
  title: 'Create B2C Invoice',
};

const coreModuleName = 'INVOICE';

const DynamicCreateB2CInvoice = ({
  onCancel,
  name,
  invoiceType,
  setInvoiceType,
}) => {
  const router = useRouter();
  const enterpriseId = getEnterpriseId();
  const translations = useTranslations('components.create_B2C_Invoice');

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    const draft = SessionStorageService.get('b2CInvoiceDraft');
    return {
      clientType: 'B2C',
      sellerEnterpriseId: enterpriseId,
      buyerId: draft?.buyerId || null,
      buyerName: draft?.buyerName || null,
      addressType: draft?.addressType || null,
      buyerAddress: draft?.buyerAddress || null,
      gstAmount: draft?.gstAmount || null,
      amount: draft?.amount || null,
      orderType: 'SALES',
      roundOffType: draft?.roundOffType || 'ADD',
      invoiceType: draft?.invoiceType || invoiceType || '',
      orderItems: draft?.orderItems || [],
      bankAccountId: draft?.bankAccountId || null,
      socialLinks: draft?.socialLinks || null,
      remarks: draft?.remarks || null,
      pin: draft?.pin || null,
      invoiceDate: draft?.invoiceDate || moment().format('YYYY-MM-DD'),
      itemDraft: draft?.itemDraft || {},
      name,
    };
  });

  const { data: activeWorkflowData } = useActiveWorkflowRuntime(coreModuleName);
  const [evaluatedStepsMap, setEvaluatedStepsMap] = useState({});
  const nextStepPreviewMutation = useNextStepPreview();

  const stepsConfig = React.useMemo(() => {
    return getWorkflowEnhancedStepsConfig(
      DynamicB2CInvoiceStepsConfig,
      activeWorkflowData,
      coreModuleName,
      evaluatedStepsMap,
    );
  }, [activeWorkflowData, evaluatedStepsMap]);

  const hasActiveWorkflow =
    activeWorkflowData?.source === 'NO_CODE_WORKFLOW' &&
    activeWorkflowData?.runtime;

  const runtimeTransitions = activeWorkflowData?.runtime?.transitions || [];
  const runtimeSteps = activeWorkflowData?.runtime?.steps || [];

  const hasTransitionsWithCondition = runtimeTransitions.some((tr) =>
    Boolean(tr.condition && tr.condition.path),
  );
  const hasPrefillMappings = runtimeSteps.some((st) =>
    Boolean(st.config?.prefillMappings?.length || st.prefillMappings?.length),
  );

  const shouldForceNotLastStep =
    hasActiveWorkflow && (hasTransitionsWithCondition || hasPrefillMappings);

  const handleBeforeNext = async (currentStepIndex, stepConfig) => {
    if (!hasTransitionsWithCondition && !hasPrefillMappings) return true;

    const isSystemStep =
      stepConfig.key === 'invoice-details' || stepConfig.stepType === 'SYSTEM';

    const currentStepKey = isSystemStep
      ? 'SYSTEM_INVOICE_START'
      : stepConfig.rawKey || stepConfig.key.replace('workflow-', '');

    const conditionPaths = getConditionPathsFromTransitions(
      runtimeTransitions,
      currentStepKey,
      runtimeSteps,
    );

    const systemRecordData = extractConditionRecordData(
      formData,
      conditionPaths,
    );

    let payload;
    if (isSystemStep) {
      payload = {
        module: coreModuleName,
        stepKey: 'SYSTEM_INVOICE_START',
        event: 'COMPLETED',
        forms: {
          SYSTEM_INVOICE_START: systemRecordData,
          ...(formData?.workflowStepValues || {}),
        },
      };
    } else {
      const rawKey =
        stepConfig.rawKey || stepConfig.key.replace('workflow-', '');

      const formValues = extractConditionFormData(
        formData,
        rawKey,
        conditionPaths,
      );

      const allForms = {
        SYSTEM_INVOICE_START: systemRecordData,
        ...(formData?.workflowStepValues || {}),
        [rawKey]: formValues,
      };

      payload = {
        module: coreModuleName,
        stepKey: rawKey,
        event: 'SUBMITTED',
        forms: allForms,
      };
    }

    try {
      const res = await nextStepPreviewMutation.mutateAsync(payload);
      const nextStepData = res?.data?.data || res?.data || {};
      const nextKey =
        nextStepData?.nextStepKey ||
        nextStepData?.nextStep?.key ||
        nextStepData?.key;

      const prefillValues =
        nextStepData?.prefillValues ||
        nextStepData?.prefill ||
        nextStepData?.values ||
        {};

      const metadataKeys = new Set([
        'nextStepKey',
        'nextStep',
        'key',
        'stepKey',
        'status',
        'valid',
        'validationErrors',
        'message',
        'event',
        'prefillValues',
        'prefill',
        'values',
        'transitions',
        'steps',
      ]);

      const extractedPrefills = { ...prefillValues };
      Object.keys(nextStepData).forEach((k) => {
        if (!metadataKeys.has(k) && !k.startsWith('_')) {
          extractedPrefills[k] = nextStepData[k];
        }
      });

      if (Object.keys(extractedPrefills).length > 0) {
        setFormData((prev) => {
          const updatedCustomFields = { ...(prev?.customFields || {}) };
          const updatedStepValues = { ...(prev?.workflowStepValues || {}) };

          const targetStepKey = nextKey || 'SYSTEM_INVOICE_START';
          const targetStepMap = { ...(updatedStepValues[targetStepKey] || {}) };

          Object.entries(extractedPrefills).forEach(([fieldKey, val]) => {
            if (val !== undefined && val !== null && val !== '') {
              updatedCustomFields[fieldKey] = val;
              targetStepMap[fieldKey] = val;
            }
          });

          return {
            ...prev,
            ...extractedPrefills,
            customFields: updatedCustomFields,
            workflowStepValues: {
              ...updatedStepValues,
              [targetStepKey]: targetStepMap,
            },
          };
        });
      }

      const currentRawKey = isSystemStep
        ? 'SYSTEM_INVOICE_START'
        : stepConfig.rawKey || stepConfig.key?.replace('workflow-', '');

      const currentRuntimeIndex = runtimeSteps.findIndex((st) => {
        if (isSystemStep) {
          return (
            st.start ||
            st.type === 'SYSTEM' ||
            st.key === 'SYSTEM_INVOICE_START'
          );
        }
        return (
          st.key === currentRawKey || `workflow-${st.key}` === stepConfig.key
        );
      });

      const downstreamKeys = new Set();
      if (currentRuntimeIndex !== -1) {
        runtimeSteps.slice(currentRuntimeIndex + 1).forEach((st) => {
          if (st.key) {
            downstreamKeys.add(st.key);
            downstreamKeys.add(`workflow-${st.key}`);
          }
        });
      } else if (isSystemStep) {
        runtimeSteps.forEach((st) => {
          if (!st.start && st.type !== 'SYSTEM') {
            if (st.key) {
              downstreamKeys.add(st.key);
              downstreamKeys.add(`workflow-${st.key}`);
            }
          }
        });
      }

      setEvaluatedStepsMap((prev) => {
        const nextMap = { ...prev };
        downstreamKeys.forEach((key) => {
          delete nextMap[key];
        });

        if (nextKey && nextKey !== 'END' && !nextKey.startsWith('END_')) {
          nextMap[nextKey] = true;
          nextMap[`workflow-${nextKey}`] = true;
        }

        return nextMap;
      });

      if (!nextKey || nextKey === 'END' || nextKey.startsWith('END_')) {
        return 'SUBMIT';
      }
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to preview next step condition:', err);
      return 'SUBMIT';
    }
  };

  const handleBackNavigation = () => {
    onCancel();
    router.push(INVOICE_CONFIG.homePath);
  };

  const enhancedFormData = {
    ...formData,
    activeWorkflowData,
  };

  const { handleSubmit, invoiceMutation } = useB2CInvoiceActions({
    order: enhancedFormData,
    fields: enhancedFormData._formFields,
    isGstApplicableForSalesOrders:
      enhancedFormData.isGstApplicableForSalesOrders,
    translations,
    activeWorkflowData,
  });

  return (
    <div className="h-full">
      <MultiStepForm
        steps={stepsConfig}
        formData={enhancedFormData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        onSubmit={() => handleSubmit(enhancedFormData)}
        onCancel={onCancel}
        onBeforeNext={handleBeforeNext}
        isSubmitting={invoiceMutation.isPending}
        onBack={handleBackNavigation}
        forceNotLastStep={shouldForceNotLastStep}
        headerExtra={
          <InvoiceTypePopover
            triggerInvoiceTypeModal={
              <button className="flex items-center rounded p-1 hover:bg-neutral-100">
                <ChevronDown
                  className="cursor-pointer text-neutral-500 hover:text-primary"
                  size={20}
                />
              </button>
            }
            invoiceType={invoiceType}
            setInvoiceType={setInvoiceType}
          />
        }
        breadcrumbs={INVOICE_CONFIG.breadcrumbs}
        breadcrumbHome={INVOICE_CONFIG.homePath}
        breadcrumbHomeText={INVOICE_CONFIG.homeText}
        breadcrumbTitle={INVOICE_CONFIG.title}
      />
    </div>
  );
};

export default DynamicCreateB2CInvoice;
