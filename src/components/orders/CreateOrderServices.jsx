import { LocalStorageService } from '@/lib/utils';
import {
  CreateOrderService as createOrderApiService,
  OrderDetails,
  updateOrder,
  updateOrderForUnrepliedSales,
} from '@/services/Orders_Services/Orders_Services';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '@/api/order_api/order_api';
import MultiStepForm from '../shared/MultiStepForm/MultiStepForm';
import { Button } from '../ui/button';
import { getSalesServiceFormSteps } from './Sales_Service_MultiStep_Form/Create-Sales-Service-config';

const CreateOrderServices = ({
  createSalesServiceBreadCrumbs,
  cta,
  orderId,
  setIsCreatingSalesService,
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [formData, setFormData] = React.useState({
    clientType: 'B2B',
    sellerEnterpriseId: cta === 'offer' ? enterpriseId : null,
    buyerId: cta === 'offer' ? null : enterpriseId,
    orderType: 'SALES',
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
  });
  const [errors, setErrors] = React.useState({});

  // Fetch order details if orderId is provided
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
        clientId: fetchedOrderDetails.buyerId, // This might need mapping if clientId != buyerId
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
      });
    }
  }, [isOrderDetailsSuccess, fetchedOrderDetails]);

  // create
  const orderMutation = useMutation({
    mutationFn: createOrderApiService,
    onSuccess: (res) => {
      toast.success(
        cta === 'offer'
          ? 'Offer Created Successfully'
          : 'Bid Created Successfully',
      );

      if (setIsCreatingSalesService) {
        setIsCreatingSalesService(false);
      } else {
        const targetId = res.data.data.id;
        if (cta !== 'offer') {
          router.push(`/dashboard/purchases/purchase-orders/${targetId}`);
        } else {
          router.push(`/dashboard/sales/sales-orders/${targetId}`);
        }
      }

      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Something went wrong');
    },
  });

  // update
  // mutation Fn for update order (purchase || sales && unconfirmed clients)
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
      setIsCreatingSalesService(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // mutation Fn for update order (confirmed clients with no reply recieved)
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
      setIsCreatingSalesService(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = async () => {
    if (orderId) {
      if (
        cta === 'offer' &&
        fetchedOrderDetails?.buyerType !== 'UNINVITED-ENTERPRISE'
      ) {
        updateOrderForUnRepliedSalesMutation.mutate({ ...formData, orderId });
      } else {
        updateOrderMutation.mutate({ ...formData, orderId });
      }
    } else {
      orderMutation.mutate(formData);
    }
  };

  const handleCancel = () => {
    if (setIsCreatingSalesService) {
      setIsCreatingSalesService(false);
    } else {
      router.back();
    }
  };

  const directServiceOrderSteps = getSalesServiceFormSteps();

  return (
    <MultiStepForm
      steps={directServiceOrderSteps}
      formData={formData}
      setFormData={setFormData}
      errors={errors}
      setErrors={setErrors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={
        orderMutation.isPending ||
        updateOrderMutation.isPending ||
        updateOrderForUnRepliedSalesMutation.isPending
      }
      breadcrumbs={createSalesServiceBreadCrumbs}
      breadcrumbHome="/dashboard/sales/sales-orders"
      breadcrumbHomeText="Sales Orders"
      breadcrumbTitle="Create Sales Service"
      finalStepActions={({ handleFinalSubmit, isSubmitting }) => (
        <Button
          size="sm"
          onClick={() => handleFinalSubmit('submit')}
          disabled={isSubmitting}
        >
          {isSubmitting
            ? orderId
              ? 'Updating...'
              : 'Creating...'
            : orderId
              ? '✓ Update Sales Service'
              : '✓ Create Sales Service'}
        </Button>
      )}
    />
  );
};

export default CreateOrderServices;
