import { useMutation } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { getFormConfig } from '@/services/Form_Config_Services/FormConfigServices';
import { CreateOrderService } from '@/services/Orders_Services/Orders_Services';

import { useActiveWorkflowRuntime } from '@/hooks/workflows/useWorkflowRuntime';

import MultiStepForm from '../shared/MultiStepForm/MultiStepForm';
import { Button } from '../ui/button';
import {
  DynamicGoodsOrderStepsConfig,
  getWorkflowEnhancedStepsConfig,
} from './Goods_MultiStep_Form/DynamicCreate_Order_Goods';
import { buildEnhancedOrderPayload } from './utils/orderPayloadHelper';

const ORDER_CONFIG = {
  offer: {
    breadcrumbs: [
      {
        id: 1,
        name: 'Sales',
        path: '/dashboard/sales/sales-orders',
        show: true,
      },
      { id: 2, name: 'Create Sales Goods', path: '#', show: true },
    ],
    homePath: '/dashboard/sales/sales-orders',
    homeText: 'Sales Orders',
    title: 'Create Sales Goods',
    submitText: '✓ Create Sales Goods',
    successToast: 'Offer Created Successfully',
  },
  purchase: {
    breadcrumbs: [
      {
        id: 1,
        name: 'Purchases',
        path: '/dashboard/purchases/purchase-orders',
        show: true,
      },
      { id: 2, name: 'Create Purchase Goods', path: '#', show: true },
    ],
    homePath: '/dashboard/purchases/purchase-orders',
    homeText: 'Purchase Orders',
    title: 'Create Purchase Goods',
    submitText: '✓ Create Purchase Goods',
    successToast: 'Bid Created Successfully',
  },
};

const calculateTotals = (orderItems = []) => {
  const amount = orderItems.reduce(
    (acc, curr) => acc + (Number(curr.totalAmount) || 0),
    0,
  );
  const gstAmount = orderItems.reduce(
    (acc, curr) => acc + (Number(curr.totalGstAmount) || 0),
    0,
  );

  return {
    amount: Number(amount.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
  };
};

const coreModuleName = 'ORDER';

const DynamicCreateOrderS = ({
  isCreatingSales,
  isCreatingPurchase,
  onCancel,
  name,
  cta,
  isOrder,
  referenceOrderId,
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const isOffer = cta === 'offer';
  const config = isOffer ? ORDER_CONFIG.offer : ORDER_CONFIG.purchase;

  const enterpriseId = getEnterpriseId();
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(() => {
    const orderDraft = isCreatingSales
      ? SessionStorageService.get('orderDraft')
      : null;
    const bidDraft = isCreatingPurchase
      ? SessionStorageService.get('bidDraft')
      : null;
    const draft = isOffer ? orderDraft : bidDraft;

    return isOffer
      ? {
          clientType: 'B2B',
          sellerEnterpriseId: enterpriseId,
          buyerId: draft?.buyerId || null,
          selectedValue: draft?.selectedValue || null,
          gstAmount: draft?.gstAmount || null,
          amount: draft?.amount || null,
          orderType: 'SALES',
          invoiceType: 'GOODS',
          orderItems: draft?.orderItems || [],
          notesToCustomer: draft?.notesToCustomer || '',
          ...draft,
          isCreatingSales,
          isCreatingPurchase,
          name,
          cta,
          isOrder,
          referenceOrderId,
          isPurchasePage,
        }
      : {
          clientType: 'B2B',
          sellerEnterpriseId: draft?.sellerEnterpriseId || null,
          buyerId: enterpriseId,
          selectedValue: draft?.selectedValue || null,
          gstAmount: draft?.gstAmount || null,
          amount: draft?.amount || null,
          orderType: 'PURCHASE',
          invoiceType: 'GOODS',
          orderItems: draft?.orderItems || [],
          notesToCustomer: draft?.notesToCustomer || '',
          ...draft,
          isCreatingSales,
          isCreatingPurchase,
          name,
          cta,
          isOrder,
          referenceOrderId,
          isPurchasePage,
        };
  });

  // Fetch form configuration schema when cta changes
  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      const moduleName = isOffer ? 'SALES_ORDER' : 'PURCHASE_ORDER';
      try {
        const formConfig = await getFormConfig(moduleName);
        if (isMounted && formConfig?.fields) {
          setFields(formConfig.fields);
        }
      } catch (error) {
        toast.error('Failed to fetch form configuration:', error);
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, [cta, isOffer]);

  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: (res) => {
      toast.success(config.successToast);
      const createdId = res?.data?.data?.id;

      if (isPurchasePage) {
        SessionStorageService.remove('bidDraft');
        router.push(`/dashboard/purchases/purchase-orders/${createdId}`);
      } else {
        SessionStorageService.remove('orderDraft');
        router.push(`/dashboard/sales/sales-orders/${createdId}`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const { data: activeWorkflowData } = useActiveWorkflowRuntime(coreModuleName);

  const handleSubmit = () => {
    const { amount, gstAmount } = calculateTotals(formData.orderItems);

    const rawPayload = {
      ...formData,
      clientType: formData.clientType,
      sellerEnterpriseId: formData.sellerEnterpriseId,
      buyerId: Number(formData.buyerId),
      selectedValue: formData.selectedValue || null,
      gstAmount,
      amount,
      orderType: formData.orderType,
      invoiceType: 'GOODS',
      orderItems: [...(formData.orderItems || [])],
      billingAddressId: formData.billingAddressId || null,
      shippingAddressId: formData.shippingAddressId || null,
      paymentTerms: formData.paymentTerms || '',
      offerValidity: formData.offerValidity || '',
      offerTerms: formData.offerTerms || '',
      buyerType: formData.buyerType,
    };

    const cleanPayload = buildEnhancedOrderPayload(
      rawPayload,
      activeWorkflowData,
      formData._formFields || fields,
    );

    orderMutation.mutate(cleanPayload);
  };

  const stepsConfig = React.useMemo(() => {
    return getWorkflowEnhancedStepsConfig(
      DynamicGoodsOrderStepsConfig,
      activeWorkflowData,
      coreModuleName,
    );
  }, [activeWorkflowData, coreModuleName]);

  const handleBackNavigation = () => {
    onCancel();
    router.push(config.homePath);
  };

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
        isSubmitting={orderMutation.isPending}
        onBack={handleBackNavigation}
        breadcrumbs={config.breadcrumbs}
        breadcrumbHome={config.homePath}
        breadcrumbHomeText={config.homeText}
        breadcrumbTitle={config.title}
        finalStepActions={({ handleFinalSubmit, isSubmitting }) => (
          <Button
            size="sm"
            onClick={() => handleFinalSubmit('submit')}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : config.submitText}
          </Button>
        )}
      />
    </div>
  );
};

export default DynamicCreateOrderS;
