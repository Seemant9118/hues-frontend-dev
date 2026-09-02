'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { orderApi } from '@/api/order_api/order_api';
import {
  useActiveWorkflowRuntime,
  useNextStepPreview,
} from '@/hooks/workflows/useWorkflowRuntime';
import { LocalStorageService } from '@/lib/utils';
import {
  CreateOrderService as createOrderApiService,
  OrderDetails,
  updateOrder,
  updateOrderForUnrepliedSales,
} from '@/services/Orders_Services/Orders_Services';
import {
  extractConditionFormData,
  extractConditionRecordData,
  getConditionPathsFromTransitions,
} from '@/utils/workflowConditionHelper';
import { getWorkflowEnhancedServiceStepsConfig } from '../Sales_Service_MultiStep_Form/Create-Sales-Service-config';
import { buildEnhancedOrderPayload } from '../utils/orderPayloadHelper';

export function useCreateOrderServices({
  cta,
  orderId,
  setIsCreatingSalesService,
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [formData, setFormData] = React.useState({
    clientType: 'B2B',
    sellerEnterpriseId: cta === 'offer' ? enterpriseId : null,
    buyerId: cta === 'offer' ? null : enterpriseId,
    orderType: cta === 'offer' ? 'SALES' : 'PURCHASE',
    invoiceType: 'SERVICE',
    contactPerson: '',
    email: '',
    mobile: '',
    billingAddressText: '',
    serviceLocation: '',
    orderItems: null,
    gstAmount: null,
    amount: null,
    isEditing: !!orderId,
    cta,
    paymentTerms: '',
    offerValidity: '',
  });
  const [errors, setErrors] = React.useState({});
  const [evaluatedStepsMap, setEvaluatedStepsMap] = React.useState({});

  const moduleName = 'ORDER';
  const { data: activeWorkflowData } = useActiveWorkflowRuntime(moduleName);
  const nextStepPreviewMutation = useNextStepPreview();

  // Fetch order details if editing
  const { data: fetchedOrderDetails, isSuccess: isOrderDetailsSuccess } =
    useQuery({
      queryKey: [orderApi.getOrderDetails.endpointKey, orderId],
      queryFn: () => OrderDetails(orderId),
      enabled: !!orderId,
      select: (res) => res.data.data,
    });

  useEffect(() => {
    if (isOrderDetailsSuccess && fetchedOrderDetails) {
      setFormData({
        clientId: fetchedOrderDetails.buyerId,
        buyerId: fetchedOrderDetails.buyerId,
        sellerEnterpriseId: fetchedOrderDetails.sellerEnterpriseId,
        clientType: fetchedOrderDetails.clientType || 'B2B',
        orderType: fetchedOrderDetails.orderType || 'SALES',
        invoiceType: fetchedOrderDetails.invoiceType || 'SERVICE',
        contactPerson: fetchedOrderDetails.contactPerson || '',
        email: fetchedOrderDetails.email || '',
        mobile: fetchedOrderDetails.mobile || '',
        billingAddressText: fetchedOrderDetails.billingAddressText || '',
        serviceLocation: fetchedOrderDetails.serviceLocation || '',
        orderItems:
          fetchedOrderDetails.orderItems?.map((item) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            productId: item.productId || item.productDetails?.id,
            serviceName:
              item.serviceName ||
              item.productDetails?.serviceName ||
              item.productDetails?.name,
            serviceConfig: item.itemConfig || item.serviceConfig || {},
          })) || [],
        gstAmount: fetchedOrderDetails.gstAmount || null,
        amount: fetchedOrderDetails.amount || null,
        version: fetchedOrderDetails.version,
        buyerType: fetchedOrderDetails.buyerType,
        isEditing: true,
        cta,
        paymentTerms: fetchedOrderDetails.paymentTerms || '',
        offerValidity: fetchedOrderDetails.offerValidity || '',
      });
    }
  }, [isOrderDetailsSuccess, fetchedOrderDetails, cta]);

  // Create order mutation
  const orderMutation = useMutation({
    mutationFn: createOrderApiService,
    onSuccess: (res) => {
      toast.success(
        cta === 'offer'
          ? 'Offer Created Successfully'
          : 'Bid Created Successfully',
      );

      const targetId = res.data.data.id;

      if (setIsCreatingSalesService) {
        setIsCreatingSalesService(false);
      }

      if (cta !== 'offer') {
        router.push(`/dashboard/purchases/purchase-orders/${targetId}`);
      } else {
        router.push(`/dashboard/sales/sales-orders/${targetId}`);
      }

      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationKey: [orderApi.updateOrder.endpointKey],
    mutationFn: (data) => updateOrder(orderId, data),
    onSuccess: () => {
      toast.success('Order revised Successfully');
      if (cta !== 'offer') {
        router.push(`/dashboard/purchases/purchase-orders/${orderId}`);
      } else {
        router.push(`/dashboard/sales/sales-orders/${orderId}`);
      }
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // Update unreplied sales order mutation
  const updateOrderForUnRepliedSalesMutation = useMutation({
    mutationKey: [orderApi.updateOrderForUnrepliedSales.endpointKey],
    mutationFn: (data) => updateOrderForUnrepliedSales(data),
    onSuccess: (res) => {
      toast.success('Order revised Successfully');
      if (cta !== 'offer') {
        router.push(
          `/dashboard/purchases/purchase-orders/${res.data.data.newOrderId}`,
        );
      } else {
        router.push(
          `/dashboard/sales/sales-orders/${res.data.data.newOrderId}`,
        );
      }
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = async () => {
    const cleanPayload = buildEnhancedOrderPayload(
      formData,
      activeWorkflowData,
      [],
    );

    if (orderId) {
      if (
        cta === 'offer' &&
        fetchedOrderDetails?.buyerType !== 'UNINVITED-ENTERPRISE'
      ) {
        updateOrderForUnRepliedSalesMutation.mutate({
          ...cleanPayload,
          orderId,
        });
      } else {
        updateOrderMutation.mutate({ ...cleanPayload, orderId });
      }
    } else {
      orderMutation.mutate(cleanPayload);
    }
  };

  const handleCancel = () => {
    if (setIsCreatingSalesService) {
      setIsCreatingSalesService(false);
    } else {
      router.back();
    }
  };

  const directServiceOrderSteps = React.useMemo(() => {
    return getWorkflowEnhancedServiceStepsConfig({
      cta,
      activeWorkflow: activeWorkflowData,
      moduleName,
      evaluatedStepsMap,
    });
  }, [cta, activeWorkflowData, moduleName, evaluatedStepsMap]);

  const handleBeforeNext = async (currentStepIndex, stepConfig) => {
    const runtimeTransitions = activeWorkflowData?.runtime?.transitions || [];
    const hasTransitionsWithCondition = runtimeTransitions.some((tr) =>
      Boolean(tr.condition && tr.condition.path),
    );

    if (!hasTransitionsWithCondition) return true;

    const isSystemStep =
      stepConfig.key === 'buyer-context' ||
      stepConfig.key === 'services-line-items' ||
      stepConfig.stepType === 'SYSTEM';

    let payload;
    if (isSystemStep) {
      const conditionPaths = getConditionPathsFromTransitions(
        runtimeTransitions,
        'SYSTEM_ORDER_START',
      );
      const recordData = extractConditionRecordData(formData, conditionPaths);

      payload = {
        module: moduleName,
        stepKey: 'SYSTEM_ORDER_START',
        event: 'COMPLETED',
        record: recordData,
      };
    } else {
      const rawKey =
        stepConfig.rawKey || stepConfig.key.replace('workflow-', '');
      const conditionPaths = getConditionPathsFromTransitions(
        runtimeTransitions,
        rawKey,
      );
      const formValues = extractConditionFormData(
        formData,
        rawKey,
        conditionPaths,
      );

      payload = {
        module: moduleName,
        stepKey: rawKey,
        event: 'SUBMITTED',
        forms: {
          [rawKey]: formValues,
        },
      };
    }

    try {
      const res = await nextStepPreviewMutation.mutateAsync(payload);
      const nextStepData = res?.data?.data || res?.data;
      const nextKey =
        nextStepData?.nextStepKey ||
        nextStepData?.nextStep?.key ||
        nextStepData?.key;

      const runtimeSteps = activeWorkflowData?.runtime?.steps || [];
      const currentRawKey = isSystemStep
        ? 'SYSTEM_ORDER_START'
        : stepConfig.rawKey || stepConfig.key?.replace('workflow-', '');

      const currentRuntimeIndex = runtimeSteps.findIndex((st) => {
        if (isSystemStep) {
          return (
            st.start || st.type === 'SYSTEM' || st.key === 'SYSTEM_ORDER_START'
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

  const isSubmitting =
    orderMutation.isPending ||
    updateOrderMutation.isPending ||
    updateOrderForUnRepliedSalesMutation.isPending;

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    directServiceOrderSteps,
    handleSubmit,
    handleCancel,
    handleBeforeNext,
    isSubmitting,
  };
}
