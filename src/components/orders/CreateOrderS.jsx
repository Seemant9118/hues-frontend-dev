import { getEnterpriseId } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { CreateOrderService } from '@/services/Orders_Services/Orders_Services';
import { useMutation } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import MultiStepForm from '../shared/MultiStepForm/MultiStepForm';
import { Button } from '../ui/button';

import { GoodsOrderStepsConfig } from './Goods_MultiStep_Form/Create_Order_Goods';

const CreateOrderS = ({
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

  const enterpriseId = getEnterpriseId();
  const orderDraft = isCreatingSales && SessionStorageService.get('orderDraft');
  const bidDraft = isCreatingPurchase && SessionStorageService.get('bidDraft');

  const [formData, setFormData] = useState(
    cta === 'offer'
      ? {
          clientType: 'B2B',
          sellerEnterpriseId: enterpriseId,
          buyerId: orderDraft?.buyerId || null,
          selectedValue: orderDraft?.selectedValue || null,
          gstAmount: orderDraft?.gstAmount || null,
          amount: orderDraft?.amount || null,
          orderType: 'SALES',
          invoiceType: 'GOODS',
          orderItems: orderDraft?.orderItems || [],
          notesToCustomer: orderDraft?.notesToCustomer || '',
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
          sellerEnterpriseId: bidDraft?.sellerEnterpriseId || null,
          buyerId: enterpriseId,
          selectedValue: bidDraft?.selectedValue || null,
          gstAmount: bidDraft?.gstAmount || null,
          amount: bidDraft?.amount || null,
          orderType: 'PURCHASE',
          invoiceType: 'GOODS',
          orderItems: bidDraft?.orderItems || [],
          notesToCustomer: bidDraft?.notesToCustomer || '',
          isCreatingSales,
          isCreatingPurchase,
          name,
          cta,
          isOrder,
          referenceOrderId,
          isPurchasePage,
        },
  );

  const [errors, setErrors] = useState({});

  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: (res) => {
      toast.success(
        cta === 'offer'
          ? 'Offer Created Successfully'
          : 'Bid Created Successfully',
      );
      if (isPurchasePage) {
        router.push(`/dashboard/purchases/purchase-orders/${res.data.data.id}`);
        SessionStorageService.remove('bidDraft');
      } else {
        router.push(`/dashboard/sales/sales-orders/${res.data.data.id}`);
        SessionStorageService.remove('orderDraft');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  const handleSubmit = () => {
    // Action will be 'submit'
    // Calculate total amount and gst from items safely
    const parsedAmount =
      formData.orderItems?.reduce(
        (acc, curr) => acc + (Number(curr.totalAmount) || 0),
        0,
      ) || 0;
    const parsedGst =
      formData.orderItems?.reduce(
        (acc, curr) => acc + (Number(curr.totalGstAmount) || 0),
        0,
      ) || 0;

    const payload = {
      clientType: formData.clientType,
      sellerEnterpriseId: formData.sellerEnterpriseId,
      buyerId: Number(formData.buyerId),
      selectedValue: formData.selectedValue || null,
      gstAmount: Number(parsedGst.toFixed(2)),
      amount: Number(parsedAmount.toFixed(2)),
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

    orderMutation.mutate(payload);
  };

  const salesOrderBreadCrumbs = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Sales', link: '/dashboard/sales' },
    { label: 'Sales Orders', link: '/dashboard/sales/sales-orders' },
    { label: 'Create Sales Goods', link: '#' },
  ];

  const purchaseOrderBreadCrumbs = [
    { label: 'Dashboard', link: '/dashboard' },
    { label: 'Purchases', link: '/dashboard/purchases' },
    { label: 'Purchase Orders', link: '/dashboard/purchases/purchase-orders' },
    { label: 'Create Purchase Goods', link: '#' },
  ];

  return (
    <div className="h-full">
      <MultiStepForm
        steps={GoodsOrderStepsConfig}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isSubmitting={orderMutation.isPending}
        breadcrumbs={
          cta === 'offer' ? salesOrderBreadCrumbs : purchaseOrderBreadCrumbs
        }
        breadcrumbHome={
          cta === 'offer'
            ? '/dashboard/sales/sales-orders'
            : '/dashboard/purchases/purchase-orders'
        }
        breadcrumbHomeText={
          cta === 'offer' ? 'Sales Orders' : 'Purchase Orders'
        }
        breadcrumbTitle={
          cta === 'offer' ? 'Create Sales Goods' : 'Create Purchase Goods'
        }
        finalStepActions={({ handleFinalSubmit, isSubmitting }) => (
          <Button
            size="sm"
            onClick={() => handleFinalSubmit('submit')}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Creating...'
              : cta === 'offer'
                ? '✓ Create Sales Goods'
                : '✓ Create Purchase Goods'}
          </Button>
        )}
      />
    </div>
  );
};

export default CreateOrderS;
