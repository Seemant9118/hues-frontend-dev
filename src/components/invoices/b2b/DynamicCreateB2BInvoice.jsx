'use client';

import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
import { Button } from '@/components/ui/button';
import {
  DynamicB2BInvoiceStepsConfig,
  getWorkflowEnhancedStepsConfig,
} from './DynamicCreate_Invoice_B2B';

const INVOICE_CONFIG = {
  breadcrumbs: [
    {
      id: 1,
      name: 'Sales',
      path: '/dashboard/sales/sales-invoices',
      show: true,
    },
    { id: 2, name: 'Create Sales Invoice', path: '#', show: true },
  ],
  homePath: '/dashboard/sales/sales-invoices',
  homeText: 'Sales Invoices',
  title: 'Create Sales Invoice',
};

const coreModuleName = 'INVOICE';

const DynamicCreateB2BInvoice = ({
  onCancel,
  name,
  cta,
  isOrder,
  invoiceType,
  setInvoiceType,
}) => {
  const router = useRouter();
  const enterpriseId = getEnterpriseId();

  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    const draft = SessionStorageService.get('b2bInvoiceDraft');
    return {
      source: draft?.source || '',
      invoiceReferenceNumber: draft?.invoiceReferenceNumber || null,
      orderId: draft?.orderId || null,
      selectedOrder: draft?.selectedOrder || null,
      saveAsGstDraft: draft?.saveAsGstDraft || false,
      authorizedPersonId: draft?.authorizedPersonId || null,
      authorizedPerson: draft?.authorizedPerson || null,
      clientType: 'B2B',
      sellerEnterpriseId: enterpriseId,
      buyerId: draft?.buyerId || null,
      gstAmount: draft?.gstAmount || null,
      amount: draft?.amount || null,
      orderType: 'SALES',
      invoiceType: draft?.invoiceType || '',
      orderItems: draft?.orderItems || [],
      bankAccountId: draft?.bankAccountId || null,
      socialLinks: draft?.socialLinks || null,
      remarks: draft?.remarks || null,
      pin: draft?.pin || null,
      billingAddressId: draft?.billingAddressId || null,
      shippingAddressId: draft?.shippingAddressId || null,
      selectedValue: draft?.selectedValue || null,
      selectedGstNumber: draft?.selectedGstNumber || null,
      getAddressRelatedData: draft?.getAddressRelatedData || null,
      invoiceDate: draft?.invoiceDate || moment().format('YYYY-MM-DD'),
      buyerType: draft?.buyerType || null,
      roundOffAmount: draft?.roundOffAmount || 0,
      roundOffType: draft?.roundOffType || 'ADD',
      itemDraft: draft?.itemDraft || {},
      name,
      cta,
      isOrder,
    };
  });

  const { data: activeWorkflowData } = useActiveWorkflowRuntime(coreModuleName);
  const [evaluatedStepsMap, setEvaluatedStepsMap] = useState({});
  const nextStepPreviewMutation = useNextStepPreview();

  const stepsConfig = React.useMemo(() => {
    return getWorkflowEnhancedStepsConfig(
      DynamicB2BInvoiceStepsConfig,
      activeWorkflowData,
      coreModuleName,
      evaluatedStepsMap,
    );
  }, [activeWorkflowData, evaluatedStepsMap]);

  const handleBeforeNext = async (currentStepIndex, stepConfig) => {
    const runtimeTransitions = activeWorkflowData?.runtime?.transitions || [];
    const runtimeSteps = activeWorkflowData?.runtime?.steps || [];

    const hasTransitionsWithCondition = runtimeTransitions.some((tr) =>
      Boolean(tr.condition && tr.condition.path),
    );
    const hasPrefillMappings = runtimeSteps.some((st) =>
      Boolean(st.config?.prefillMappings?.length || st.prefillMappings?.length),
    );

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
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to preview next step condition:', err);
    }

    return true;
  };

  const handleBackNavigation = () => {
    onCancel();
    router.push(INVOICE_CONFIG.homePath);
  };

  // We inject activeWorkflowData so FinalPreview can use it
  const enhancedFormData = {
    ...formData,
    activeWorkflowData,
  };

  return (
    <div className="h-full">
      <MultiStepForm
        steps={stepsConfig}
        formData={enhancedFormData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        onSubmit={() => {}} // Invoice creation is handled by FinalPreview via PINVerifyModal
        onCancel={onCancel}
        onBeforeNext={handleBeforeNext}
        isSubmitting={false} // Handled within InvoicePreview
        onBack={handleBackNavigation}
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
        finalStepActions={({ isSubmitting }) => (
          <Button
            size="sm"
            onClick={() => {
              const btn = document.getElementById('hidden-create-invoice-btn');
              if (btn) btn.click();
            }}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            Create Invoice
          </Button>
        )}
      />
    </div>
  );
};

export default DynamicCreateB2BInvoice;
