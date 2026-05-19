/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  capitalize,
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
  toDisplayDate,
  toInputDate,
} from '@/appUtils/helperFunctions';
import { Input } from '@/components/ui/input';
import useOrderTotals from '@/hooks/useOrderTotals';
import { LocalStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
  getVendorProductCatalogue,
  getVendorServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  OrderDetails,
  updateOrder,
  updateOrderForUnrepliedSales,
} from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithSelect from '../ui/InputWithSelect';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Textarea } from '../ui/textarea';
import Wrapper from '../wrappers/Wrapper';

const unitForService = [
  { id: 'PER_HOUR', abbreviation: 'per hour' },
  { id: 'PER_DAY', abbreviation: 'per day' },
  { id: 'PER_MONTH', abbreviation: 'per month' },
  { id: 'PER_VISIT', abbreviation: 'per visit' },
  { id: 'PER_PROJECT', abbreviation: 'per project' },
  { id: 'PER_CONSULTATION', abbreviation: 'per consultation' },
  { id: 'FIXED', abbreviation: 'fixed' },
];

const deliveryModes = [
  { label: 'On-site', value: 'onsite' },
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
];

const timeWindows = [
  { value: 'MOR_9_to_12', label: 'Morning (9 AM - 12 PM)' },
  { value: 'AFTERNOON_12_TO_4', label: 'Afternoon (12 PM - 4 PM)' },
  { value: 'EVENING_4_TO_7', label: 'Evening (4 PM - 7 PM)' },
  { value: 'CUSTOM', label: 'Custom Slot' },
];

const EditOrderS = ({ onCancel, cta, isOrder, orderId }) => {
  const translations = useTranslations('components.create_edit_order');

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const [errorMsg, setErrorMsg] = useState({});
  // for purchase-orders gst/non-gst check
  const [
    isGstApplicableForPurchaseOrders,
    setIsGstApplicableForPurchaseOrders,
  ] = useState(false);

  // Fetch order details
  const {
    isLoading,
    data: orderDetails,
    isSuccess: isOrderDetailsSuccess,
  } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, orderId],
    queryFn: () => OrderDetails(orderId),
    select: (data) => data.data.data,
  });

  useEffect(() => {
    setIsGstApplicableForPurchaseOrders(!!orderDetails?.vendorGstNumber);
  }, [isOrderDetailsSuccess]);

  //   formatted data we needed in table rendering
  const transformOrderItems = (orderItems) => {
    return orderItems?.map((item) => {
      const { productDetails } = item;
      return {
        id: item.id,
        gstPerUnit: item.gstPerUnit,
        productId: productDetails?.id ?? null, // Use null as default if undefined
        productName: productDetails?.productName || productDetails?.serviceName, // Use empty string as default if undefined
        productType: item.productType,
        quantity: item.quantity,
        unitId: item.unitId,
        totalAmount: Number(
          item.totalAmount + item.discountAmount || 0,
        ).toFixed(2),
        totalGstAmount: item.totalGstAmount,
        unitPrice: item.unitPrice,
        version: item.version,
        negotiationStatus: item?.negotiationStatus || 'NEW',
        ...item,
      };
    });
  };

  const transformedItems = transformOrderItems(orderDetails?.orderItems);

  // Default order state
  const defaultOrder = {
    sellerEnterpriseId: enterpriseId,
    buyerId: orderDetails?.buyerId || '',
    gstAmount: orderDetails?.gstAmount || 0,
    amount: Number(
      orderDetails?.amount + orderDetails?.discountAmount || 0,
    ).toFixed(2),
    orderType: orderDetails?.orderType || '',
    invoiceType: orderDetails?.invoiceType || '',
    version: orderDetails?.version,
    orderItems: transformedItems || [],
    deletedItems: [],
    negotiationStatus: orderDetails?.negotiationStatus,
    clientType: 'B2B',
    contactPerson: orderDetails?.contactPerson || '',
    email: orderDetails?.email || '',
    mobile: orderDetails?.mobile || '',
    billingAddressText: orderDetails?.billingAddressText || '',
    serviceLocation: orderDetails?.serviceLocation || '',
    selectedValue: orderDetails?.selectedValue || null,
    expectedStartDate: orderDetails?.expectedStartDate || '',
    expectedCompletionDate: orderDetails?.expectedCompletionDate || '',
    deliveryMode: orderDetails?.deliveryMode || null,
    preferredTimeWindow: orderDetails?.preferredTimeWindow || null,
    offerValidity: orderDetails?.offerValidity || '',
    paymentTermsService: orderDetails?.paymentTermsService || '',
  };
  const [order, setOrder] = useState(defaultOrder);
  const [selectedItem, setSelectedItem] = useState({
    productName: '',
    productType: '',
    productId: null,
    quantity: null,
    unitPrice: null,
    unitId: null,
    discountPercentage: null,
    discountAmount: null,
    unit: null,
    description: null,
    gstPerUnit: null,
    totalAmount: null,
    totalGstAmount: null,
    finalAmount: null,
  });

  // update buyerId, sellerEnterpriseId according to orderType
  useEffect(() => {
    if (orderDetails) {
      const newOrder =
        orderDetails.orderType === 'SALES'
          ? {
              ...defaultOrder,
              buyerId: orderDetails.buyerId,
            }
          : {
              ...defaultOrder,
              sellerEnterpriseId: orderDetails.sellerEnterpriseId,
            };
      setOrder(newOrder);
    }
  }, [orderDetails]);

  // to condition rendering form based on invoceType (Goods/Service)
  const isOfferType = order?.invoiceType;

  // fetch profileDetails API : to check gst is present or not for seller
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: isPurchasePage === false,
  });
  // for sales-order gst/non-gst check
  const isGstApplicableForSalesOrders =
    isPurchasePage === false && !!profileDetails?.enterpriseDetails?.gstNumber;
  const gstApplicable = isGstApplicable(
    isPurchasePage
      ? isGstApplicableForPurchaseOrders
      : isGstApplicableForSalesOrders,
  );

  const calculateItem = (item, isService, gstApplicable) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const gst = gstApplicable ? Number(item.gstPerUnit || 0) : 0;
    const discount = isService ? Number(item.discountPercentage || 0) : 0;

    // Base value
    const baseValue = qty * price;

    // Service discount
    const discountAmount = isService ? (baseValue * discount) / 100 : 0;

    const valueAfterDiscount = baseValue - discountAmount;

    // GST
    const gstAmount = (valueAfterDiscount * gst) / 100;

    // Final Amount
    const finalAmount = valueAfterDiscount + gstAmount;

    return {
      ...item,

      // ALWAYS STORE THESE IN BACKEND
      discountPercentage: discount,
      discountAmount: Number(discountAmount.toFixed(2)),
      totalAmount: Number(baseValue.toFixed(2)),
      totalGstAmount: Number(gstAmount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)), // final with gst
    };
  };

  const handleOrderChange = (field, value) => {
    const updatedOrder = {
      ...order,
      [field]: value,
    };

    setOrder(updatedOrder);
  };

  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      const cleared = {
        ...selectedItem,
        quantity: 0,
        discountAmount: 0,
        totalGstAmount: 0,
        totalAmount: 0,
      };
      setSelectedItem(cleared);
      return;
    }

    if (!/^\d*\.?\d*$/.test(inputValue)) return;

    const updatedItem = { ...selectedItem, quantity: Number(inputValue) };

    const calculated = calculateItem(
      updatedItem,
      isOfferType === 'SERVICE',
      isGstApplicable(
        isPurchasePage
          ? isGstApplicableForPurchaseOrders
          : isGstApplicableForSalesOrders,
      ),
    );

    setSelectedItem(calculated);
  };

  const handlePriceChange = (e) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      const cleared = {
        ...selectedItem,
        unitPrice: 0,
        discountAmount: 0,
        totalGstAmount: 0,
        totalAmount: 0,
      };
      setSelectedItem(cleared);
      return;
    }

    const price = Number(inputValue);
    if (price < 0) return;

    const updatedItem = { ...selectedItem, unitPrice: price };

    const calculated = calculateItem(
      updatedItem,
      isOfferType === 'SERVICE',
      isGstApplicable(
        isPurchasePage
          ? isGstApplicableForPurchaseOrders
          : isGstApplicableForSalesOrders,
      ),
    );

    setSelectedItem(calculated);
  };

  const handleDiscountChange = (e) => {
    const discount = Number(e.target.value) || 0;
    const isService = isOfferType === 'SERVICE';

    const updated = calculateItem(
      { ...selectedItem, discountPercentage: discount },
      isService,
      isGstApplicable(
        isPurchasePage
          ? isGstApplicableForPurchaseOrders
          : isGstApplicableForSalesOrders,
      ),
    );

    setSelectedItem(updated);
  };

  // Update the order state when input values change in table
  const handleInputChange = (rowItem, key, newValue) => {
    setOrder((prev) => ({
      ...prev,
      orderItems: prev.orderItems.map((item) => {
        if (item.productId === rowItem.productId) {
          const updatedItem = {
            ...item,
            [key]: Number(newValue),
          };

          const isService = updatedItem.productType === 'SERVICE';
          const qty = Number(updatedItem.quantity) || 0;
          const price = Number(updatedItem.unitPrice) || 0;
          const gst = gstApplicable ? Number(updatedItem.gstPerUnit || 0) : 0;
          const discount = isService
            ? Number(updatedItem.discountPercentage || 0)
            : 0;

          // Base value (totalAmount)
          const baseValue = qty * price;

          // Service discount
          const discountAmount = isService ? (baseValue * discount) / 100 : 0;

          // GST calculation (applied after discount)
          const valueAfterDiscount = baseValue - discountAmount;
          const gstAmount = (valueAfterDiscount * gst) / 100;

          // Final Amount = totalAmount - discountAmount + totalGstAmount
          const finalAmount = valueAfterDiscount + gstAmount;

          updatedItem.discountPercentage = discount;
          updatedItem.discountAmount = Number(discountAmount.toFixed(2));
          updatedItem.totalAmount = Number(baseValue.toFixed(2));
          updatedItem.totalGstAmount = Number(gstAmount.toFixed(2));
          updatedItem.finalAmount = Number(finalAmount.toFixed(2));

          return updatedItem;
        }

        return item;
      }),
    }));
  };

  // fetch units - GOODS
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId && isOfferType === 'GOODS',
  });

  // util fn to check it item is already present in orderItems or not?
  const isItemAlreadyAdded = (itemId) =>
    order.orderItems?.some((item) => item.productId === itemId);

  // [Client's Goods and Services]
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && isOfferType === 'GOODS',
  });
  // client's goods options
  const clientsGoodsOptions = goodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id); // disable if already added

    return { value, label, disabled };
  });
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && isOfferType === 'SERVICE',
  });
  // client's services options
  const clientsServicesOptions = servicesData?.map((service) => {
    const value = {
      ...service,
      productType: 'SERVICE',
      serviceName: service.name,
    };
    const label = service.name;
    const disabled = isItemAlreadyAdded(service.id); // disable if already added

    return { value, label, disabled };
  });
  // client's item/service list rendering logic on the basis of goods/service
  const itemClientListingOptions =
    order.invoiceType === 'GOODS'
      ? clientsGoodsOptions
      : clientsServicesOptions;

  // [Vendor's Goods and Services]
  const { data: vendorGoodsData } = useQuery({
    queryKey: [
      catalogueApis.getVendorProductCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorProductCatalogue(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled:
      isPurchasePage && isOfferType === 'GOODS' && !!order.sellerEnterpriseId,
  });
  // vendor's goods options
  const vendorGoodsOptions = vendorGoodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id); // disable if already added

    return { value, label, disabled };
  });
  const { data: vendorServicesData } = useQuery({
    queryKey: [
      catalogueApis.getVendorServiceCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorServiceCatalogue(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled:
      isPurchasePage && isOfferType === 'SERVICE' && !!order.sellerEnterpriseId,
  });
  // vendor's service options
  const vendorServiceOptions = vendorServicesData?.map((service) => {
    const value = {
      ...service,
      productType: 'SERVICE',
      serviceName: service.name,
    };
    const label = service.name;
    const disabled = isItemAlreadyAdded(service.id); // disable if already added

    return { value, label, disabled };
  });
  // vendor's item/service list rendering logic on the basis of goods/service
  const itemVendorListingOptions =
    order.invoiceType === 'GOODS' ? vendorGoodsOptions : vendorServiceOptions;

  // mutation Fn for update order (purchase || sales && unconfirmed clients)
  const updateOrderMutation = useMutation({
    mutationKey: [orderApi.updateOrder.endpointKey],
    mutationFn: (data) => updateOrder(orderId, data),
    onSuccess: () => {
      toast.success(translations('form.successMsg.order_revised_successfully'));
      onCancel();
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
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
      toast.success(translations('form.successMsg.order_revised_successfully'));
      router.push(`/dashboard/sales/sales-orders/${res.data.data.newOrderId}`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // validations
  const validation = ({ order, selectedItem }) => {
    const errorObj = {};

    if (cta === 'offer') {
      if (order.clientType === 'B2B' && order?.buyerId == null) {
        errorObj.buyerId = translations('form.errorMsg.client');
      }
      if (order.clientType === 'B2C' && order?.buyerId == null) {
        errorObj.buyerId = translations('form.errorMsg.customer');
      }
      if (order.invoiceType === '') {
        errorObj.invoiceType = translations('form.errorMsg.item_type');
      }
      if (isOfferType === 'SERVICE' && order?.mobile === '') {
        errorObj.mobile = '*Please enterprise mobile number';
      }
      if (isOfferType === 'SERVICE' && order?.email === '') {
        errorObj.email = '*Please enterprise email';
      }
      if (isOfferType === 'SERVICE' && order?.billingAddressText === '') {
        errorObj.billingAddressText = '*Please Billing Address';
      }
      if (order?.orderItems?.length === 0) {
        errorObj.orderItem =
          isOrder === 'invoice'
            ? translations('form.errorMsg.itemInvoice')
            : translations('form.errorMsg.itemOrder');
      }
      if (order?.orderItems?.length < 0) {
        if (selectedItem.quantity === null) {
          errorObj.quantity = translations('form.errorMsg.quantity');
        }
        if (selectedItem.unitPrice === null) {
          errorObj.unitPrice = translations('form.errorMsg.price');
        }
        if (selectedItem.gstPerUnit === null) {
          errorObj.gstPerUnit = translations('form.errorMsg.gst');
        }
        if (selectedItem.totalGstAmount === null) {
          errorObj.totalGstAmount = translations('form.errorMsg.tax_amount');
        }
        if (selectedItem.totalAmount === null) {
          errorObj.totalAmount = translations('form.errorMsg.amount');
        }
      }
    } else {
      if (order?.sellerEnterpriseId == null) {
        errorObj.sellerEnterpriseId = translations('form.errorMsg.vendor');
      }
      if (order.invoiceType === '') {
        errorObj.invoiceType = translations('form.errorMsg.item_type');
      }
      if (order?.orderItems?.length === 0) {
        errorObj.orderItem = translations('form.errorMsg.itemBid');
      }
      if (isOfferType === 'SERVICE' && order?.mobile === '') {
        errorObj.mobile = '*Please enterprise mobile number';
      }
      if (isOfferType === 'SERVICE' && order?.email === '') {
        errorObj.email = '*Please enter enterprise email';
      }
      if (isOfferType === 'SERVICE' && order?.billingAddressText === '') {
        errorObj.billingAddressText = '*Please enter Billing Address';
      }
      if (order?.orderItems?.length < 0) {
        if (selectedItem.quantity === null) {
          errorObj.quantity = translations('form.errorMsg.quantity');
        }
        if (selectedItem.unitPrice === null) {
          errorObj.unitPrice = translations('form.errorMsg.price');
        }
        if (selectedItem.gstPerUnit === null) {
          errorObj.gstPerUnit = translations('form.errorMsg.gst');
        }
        if (selectedItem.totalGstAmount === null) {
          errorObj.totalGstAmount = translations('form.errorMsg.tax_amount');
        }
        if (selectedItem.totalAmount === null) {
          errorObj.totalAmount = translations('form.errorMsg.amount');
        }
      }
    }

    return errorObj;
  };

  // Intitial and value changes: calculate grossAmount,totalDiscountAmount,totalGstAmount
  const { grossAmount, totalDiscountAmount, totalGstAmount } = useOrderTotals(
    order?.orderItems || [],
    gstApplicable,
  );

  // handling submit fn - update
  const handleSubmit = () => {
    const isError = validation({ order, selectedItem });
    if (Object.keys(isError).length > 0) {
      setErrorMsg(isError);
      return;
    }

    const basePayload = {
      ...order,
      buyerId: Number(order.buyerId),
      discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
      amount: parseFloat(grossAmount.toFixed(2)),
      gstAmount: parseFloat(totalGstAmount.toFixed(2)),
    };

    // If purchase page OR sales order with unconfirmed clients
    const isUninvitedSales =
      !isPurchasePage && orderDetails?.buyerType === 'UNINVITED-ENTERPRISE';

    if (isPurchasePage || isUninvitedSales) {
      updateOrderMutation.mutate(basePayload);
    } else {
      updateOrderForUnRepliedSalesMutation.mutate({
        ...basePayload,
        orderId,
      });
    }
  };

  // check : if is offer then render client's item options else vendor's item options
  const itemOptions =
    cta === 'offer' ? itemClientListingOptions : itemVendorListingOptions;

  // Memoized selected option based on selectedItem.productId
  const selectedOption = useMemo(() => {
    if (!selectedItem?.productId) return null;

    return (
      itemOptions?.find(
        (item) => String(item.value.id) === String(selectedItem.productId),
      ) ?? null
    );
  }, [selectedItem?.productId, itemOptions]);

  // fn to calculate Final Amount (totalAmount,totalGstAmount)
  const handleCalculatefinalAmount = (totalGstAmount, totalAmount) => {
    const gstAmount = Number(totalGstAmount) || 0;
    const amount = Number(totalAmount) || 0;
    return amount + gstAmount;
  };

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Order" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <Wrapper className="flex min-h-[calc(100vh-1px)] flex-col">
      <SubHeader name={translations('title.revise')} />

      <div className="flex flex-1 flex-col">
        {/* 1. Section: Client/Vendor & Order Details */}
        <div className="flex-shrink-0">
          <section className="border-b border-neutral-200 bg-white p-4">
            <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-primary">
              {'Order Details'}
            </span>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Client/Vendor Name */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-500">
                  {cta === 'offer'
                    ? translations('form.label.client')
                    : translations('form.label.vendor')}
                </span>
                <span className="text-sm font-semibold text-neutral-800">
                  {cta === 'offer'
                    ? orderDetails?.clientName
                    : orderDetails?.vendorName}
                </span>
              </div>

              {/* Item Type */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-500">
                  {translations('form.label.item_type')}
                </span>
                <span className="text-sm font-semibold text-neutral-800">
                  {capitalize(orderDetails?.invoiceType)}
                </span>
              </div>
            </div>

            {isOfferType === 'SERVICE' && (
              <div className="mt-6 grid grid-cols-1 gap-6 border-t border-neutral-100 pt-6 md:grid-cols-3">
                {/* Contact Person */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">
                    Contact Person
                  </label>
                  <Input
                    placeholder="Enter contact person"
                    value={order?.contactPerson || ''}
                    onChange={(e) =>
                      handleOrderChange('contactPerson', e.target.value)
                    }
                    className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>

                {/* Mobile */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex gap-1 text-xs font-medium text-neutral-500">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="+91 0000000000"
                    value={order?.mobile || ''}
                    onChange={(e) =>
                      handleOrderChange('mobile', e.target.value)
                    }
                    className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  />
                  {errorMsg.mobile && <ErrorBox msg={errorMsg.mobile} />}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex gap-1 text-xs font-medium text-neutral-500">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="email@example.com"
                    value={order?.email || ''}
                    onChange={(e) => handleOrderChange('email', e.target.value)}
                    className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  />
                  {errorMsg.email && <ErrorBox msg={errorMsg.email} />}
                </div>

                {/* Billing Address */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="flex gap-1 text-xs font-medium text-neutral-500">
                    Billing Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Enter billing address"
                    value={order?.billingAddressText || ''}
                    onChange={(e) =>
                      handleOrderChange('billingAddressText', e.target.value)
                    }
                    className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  />
                  {errorMsg.billingAddressText && (
                    <ErrorBox msg={errorMsg.billingAddressText} />
                  )}
                </div>

                {/* Service Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">
                    Service Location
                  </label>
                  <Input
                    placeholder="If different from billing"
                    value={order?.serviceLocation || ''}
                    onChange={(e) =>
                      handleOrderChange('serviceLocation', e.target.value)
                    }
                    className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 2. Section: Add Item */}
        <section className="border-b border-neutral-200 bg-white p-4">
          <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-primary">
            {translations('title.sub_titles.add_item')}
          </span>

          <div className="flex flex-col gap-4">
            <div
              className={`grid grid-cols-1 items-end gap-4 ${isOfferType === 'SERVICE' ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}
            >
              <div className="flex flex-col gap-1.5">
                <label className="flex gap-1 text-xs font-medium text-neutral-500">
                  {translations('form.label.item')}
                  <span className="text-red-500">*</span>
                </label>
                <Select
                  name="items"
                  value={selectedOption}
                  placeholder={translations('form.input.item.placeholder')}
                  options={itemOptions}
                  styles={getStylesForSelectComponent()}
                  isOptionDisabled={(option) => option.disabled}
                  isDisabled={
                    (cta === 'offer' && order.buyerId == null) ||
                    (cta === 'bid' && order.sellerEnterpriseId == null) ||
                    order.invoiceType === ''
                  }
                  onChange={(selectedOption) => {
                    const selectedItemData = selectedOption?.value;
                    if (!selectedItemData) return;

                    const isGstApplicableForPage = isPurchasePage
                      ? isGstApplicable(isGstApplicableForPurchaseOrders)
                      : isGstApplicable(isGstApplicableForSalesOrders);

                    const gstPerUnit = isGstApplicableForPage
                      ? Number(selectedItemData.gstPercentage) || 0
                      : 0;

                    const updatedItem = {
                      ...selectedItem,
                      productId: selectedItemData.id,
                      productType: selectedItemData.productType,
                      unitPrice:
                        selectedItemData.salesPrice ??
                        selectedItemData.rate ??
                        selectedItemData.cataloguePrice ??
                        0,
                      gstPerUnit,
                      ...(selectedItemData.productType === 'GOODS'
                        ? {
                            productName: selectedItemData.name,
                            hsnCode: selectedItemData.hsnCode,
                          }
                        : {
                            serviceName:
                              selectedItemData.serviceName ||
                              selectedItemData.name,
                            sac: selectedItemData.sac,
                          }),
                    };

                    setSelectedItem(updatedItem);
                  }}
                />
                {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
              </div>

              <div className="flex flex-col gap-1.5">
                {isOfferType === 'GOODS' ? (
                  <InputWithSelect
                    id="quantity"
                    name={translations('form.label.quantity')}
                    required={true}
                    value={
                      selectedItem.quantity == null ||
                      selectedItem.quantity === 0
                        ? ''
                        : selectedItem.quantity
                    }
                    onValueChange={handleQuantityChange}
                    unit={selectedItem.unitId}
                    onUnitChange={(val) => {
                      setSelectedItem((prev) => ({
                        ...prev,
                        unitId: Number(val),
                      }));
                    }}
                    units={units?.quantity}
                    unitPlaceholder="Unit"
                    min={0}
                    step="any"
                  />
                ) : (
                  <InputWithSelect
                    id="quantity"
                    name={translations('form.label.quantity')}
                    required={true}
                    value={
                      selectedItem.quantity == null ||
                      selectedItem.quantity === 0
                        ? ''
                        : selectedItem.quantity
                    }
                    onValueChange={handleQuantityChange}
                    unit={selectedItem.unit}
                    onUnitChange={(val) => {
                      setSelectedItem((prev) => ({ ...prev, unit: val }));
                    }}
                    units={unitForService}
                    unitPlaceholder="Unit"
                    min={0}
                    step="any"
                  />
                )}
                {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  {translations('form.label.price')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  min={1}
                  value={
                    selectedItem.unitPrice == null ||
                    selectedItem.unitPrice === 0
                      ? ''
                      : selectedItem.unitPrice
                  }
                  className="h-10 w-full rounded-lg border-neutral-200 text-sm font-semibold shadow-sm focus:border-primary focus:ring-primary"
                  onChange={handlePriceChange}
                />
                {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
              </div>

              {isOfferType === 'SERVICE' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">
                    Discount (%)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={100}
                    value={selectedItem.discountPercentage || ''}
                    className="h-10 w-full rounded-lg border-neutral-200 text-sm font-semibold shadow-sm focus:border-primary focus:ring-primary"
                    onChange={handleDiscountChange}
                  />
                  {errorMsg.discountPercentage && (
                    <ErrorBox msg={errorMsg.discountPercentage} />
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  {translations('form.label.value')}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  disabled
                  value={selectedItem.totalAmount || '0.00'}
                  className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                />
              </div>
            </div>

            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) ? (
              <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">
                    {translations('form.label.gst')} (%)
                  </label>
                  <Input
                    disabled
                    value={selectedItem.gstPerUnit || '0'}
                    className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">
                    {translations('form.label.tax_amount')}
                  </label>
                  <Input
                    disabled
                    value={selectedItem.totalGstAmount || '0.00'}
                    className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-neutral-500">
                    {translations('form.label.amount')}
                  </label>
                  <div className="flex h-10 w-full items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-bold text-blue-600 shadow-sm">
                    <span>₹</span>
                    <span>
                      {Number(selectedItem.finalAmount || 0).toLocaleString(
                        'en-IN',
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedItem({
                        serviceName: '',
                        productName: '',
                        productType: '',
                        productId: null,
                        quantity: null,
                        unitId: isOfferType === 'SERVICE' && null,
                        unit: null,
                        discountPercentage: null,
                        description: null,
                        unitPrice: null,
                        gstPerUnit: null,
                        totalAmount: null,
                        totalGstAmount: null,
                        finalAmount: '',
                      });
                    }}
                  >
                    {translations('form.ctas.cancel')}
                  </Button>
                  <Button
                    size="sm"
                    className="min-w-[100px]"
                    disabled={
                      !selectedItem.productId ||
                      !selectedItem.quantity ||
                      selectedItem.quantity <= 0 ||
                      !selectedItem.unitPrice ||
                      selectedItem.unitPrice <= 0
                    }
                    onClick={() => {
                      const newItem = {
                        ...selectedItem,
                        gstPercentage: selectedItem.gstPerUnit ?? 0,
                        gstPerUnit: selectedItem.gstPerUnit ?? 0,
                        totalAmount: selectedItem.totalAmount ?? 0,
                        totalGstAmount: selectedItem.totalGstAmount ?? 0,
                        finalAmount: selectedItem.finalAmount ?? 0,
                      };
                      setOrder((prev) => ({
                        ...prev,
                        orderItems: [...(prev.orderItems || []), newItem],
                      }));
                      setSelectedItem({
                        serviceName: '',
                        productName: '',
                        productType: '',
                        productId: null,
                        quantity: null,
                        unitId: isOfferType === 'SERVICE' ? null : null,
                        unit: null,
                        discountPercentage: null,
                        description: null,
                        unitPrice: null,
                        gstPerUnit: null,
                        totalAmount: null,
                        totalGstAmount: null,
                        finalAmount: '',
                      });
                      setErrorMsg({});
                    }}
                    variant="blue_outline"
                  >
                    {translations('form.ctas.add')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedItem({
                      serviceName: '',
                      productName: '',
                      productType: '',
                      productId: null,
                      quantity: null,
                      unitId: isOfferType === 'SERVICE' && null,
                      unit: null,
                      discountPercentage: null,
                      description: null,
                      unitPrice: null,
                      gstPerUnit: null,
                      totalAmount: null,
                      totalGstAmount: null,
                      finalAmount: '',
                    });
                  }}
                >
                  {translations('form.ctas.cancel')}
                </Button>
                <Button
                  size="sm"
                  className="min-w-[100px]"
                  disabled={
                    !selectedItem.productId ||
                    !selectedItem.quantity ||
                    selectedItem.quantity <= 0 ||
                    !selectedItem.unitPrice ||
                    selectedItem.unitPrice <= 0
                  }
                  onClick={() => {
                    const newItem = {
                      ...selectedItem,
                      gstPercentage: selectedItem.gstPerUnit ?? 0,
                      gstPerUnit: selectedItem.gstPerUnit ?? 0,
                      totalAmount: selectedItem.totalAmount ?? 0,
                      totalGstAmount: selectedItem.totalGstAmount ?? 0,
                      finalAmount: selectedItem.finalAmount ?? 0,
                    };
                    setOrder((prev) => ({
                      ...prev,
                      orderItems: [...(prev.orderItems || []), newItem],
                    }));
                    setSelectedItem({
                      serviceName: '',
                      productName: '',
                      productType: '',
                      productId: null,
                      quantity: null,
                      unitId: isOfferType === 'SERVICE' ? null : null,
                      unit: null,
                      discountPercentage: null,
                      description: null,
                      unitPrice: null,
                      gstPerUnit: null,
                      totalAmount: null,
                      totalGstAmount: null,
                      finalAmount: '',
                    });
                    setErrorMsg({});
                  }}
                  variant="blue_outline"
                >
                  {translations('form.ctas.add')}
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* 3. Section: Itemized List */}
        <section className="border-b border-neutral-200 bg-white p-4">
          <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-primary">
            {translations('title.sub_titles.edit_item')}
          </span>

          <div className="overflow-hidden rounded-lg border border-neutral-100 shadow-sm">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center bg-white">
                <Loading />
              </div>
            ) : (
              <Table id={orderId}>
                <TableHeader className="bg-neutral-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {translations('form.table.header.item')}
                    </TableHead>
                    <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {translations('form.table.header.quantity')}
                    </TableHead>
                    <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {translations('form.table.header.price')}
                    </TableHead>
                    {isOfferType === 'SERVICE' && (
                      <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.table.header.discount')}
                      </TableHead>
                    )}
                    {isGstApplicable(
                      isPurchasePage
                        ? isGstApplicableForPurchaseOrders
                        : isGstApplicableForSalesOrders,
                    ) && (
                      <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                        {translations('form.table.header.gst')} (%)
                      </TableHead>
                    )}
                    <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                      {translations('form.table.header.value')}
                    </TableHead>
                    {isGstApplicable(
                      isPurchasePage
                        ? isGstApplicableForPurchaseOrders
                        : isGstApplicableForSalesOrders,
                    ) && (
                      <>
                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.table.header.tax_amount')}
                        </TableHead>
                        <TableHead className="py-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          {translations('form.table.header.amount')}
                        </TableHead>
                      </>
                    )}
                    <TableHead className="w-10 py-3"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order?.orderItems?.map((item, index) => (
                    <TableRow
                      key={item.id || `item-${index}-${item.productId}`}
                      className="group hover:bg-neutral-50/50"
                    >
                      <TableCell className="font-medium text-neutral-800">
                        {item.productName || item.serviceName}
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <InputWithSelect
                            required={true}
                            value={item.quantity === 0 ? '' : item.quantity}
                            onValueChange={(e) => {
                              const inputValue = e.target.value;
                              if (inputValue === '') {
                                handleInputChange(item, 'quantity', 0);
                                return;
                              }
                              if (!/^\d*\.?\d*$/.test(inputValue)) return;
                              const numericValue = Number(inputValue);
                              if (numericValue < 0) return;
                              handleInputChange(item, 'quantity', numericValue);
                            }}
                            selectUnitDisabled={true}
                            unit={item.unitId || item.unit}
                            units={
                              isOfferType === 'GOODS'
                                ? units?.quantity
                                : unitForService
                            }
                            min={0}
                            step="any"
                            className="h-9 border-neutral-200 text-sm shadow-sm"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleInputChange(item, 'unitPrice', e.target.value)
                          }
                          className="h-9 w-24 border-neutral-200 bg-transparent text-sm font-semibold shadow-sm focus:border-primary focus:bg-white focus:ring-primary"
                        />
                      </TableCell>
                      {isOfferType === 'SERVICE' && (
                        <TableCell>
                          <Input
                            type="number"
                            value={item.discountPercentage || 0}
                            onChange={(e) =>
                              handleInputChange(
                                item,
                                'discountPercentage',
                                e.target.value,
                              )
                            }
                            className="h-9 w-16 border-neutral-200 bg-transparent text-sm shadow-sm focus:border-primary focus:bg-white focus:ring-primary"
                          />
                        </TableCell>
                      )}
                      {isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      ) && (
                        <TableCell className="text-sm font-medium text-neutral-600">
                          {item.gstPerUnit}%
                        </TableCell>
                      )}
                      <TableCell className="text-sm font-semibold text-neutral-800">
                        ₹{' '}
                        {(Number(item.totalAmount) || 0).toLocaleString(
                          'en-IN',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          },
                        )}
                      </TableCell>
                      {isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      ) && (
                        <>
                          <TableCell className="text-sm font-medium text-neutral-600">
                            ₹{' '}
                            {(Number(item.totalGstAmount) || 0).toLocaleString(
                              'en-IN',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              },
                            )}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-neutral-900">
                            ₹{' '}
                            {handleCalculatefinalAmount(
                              item.totalGstAmount,
                              item.totalAmount,
                            ).toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-neutral-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                          onClick={() => {
                            setOrder((prev) => ({
                              ...prev,
                              orderItems: prev.orderItems.filter(
                                (orderItem) =>
                                  orderItem.productId !== item.productId,
                              ),
                              deletedItems: item.id
                                ? [...(prev.deletedItems || []), item.id]
                                : [...(prev.deletedItems || [])],
                            }));
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        {/* 4. Section: Scheduling & Logistics (Service Only) */}
        {isOfferType === 'SERVICE' && (
          <section className="border-b border-neutral-200 bg-white p-4">
            <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-primary">
              Scheduling & Logistics
            </span>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Expected Start Date
                </label>
                <Input
                  type="date"
                  value={toInputDate(order.expectedStartDate)}
                  onChange={(e) => {
                    setOrder((prev) => ({
                      ...prev,
                      expectedStartDate: toDisplayDate(e.target.value),
                    }));
                  }}
                  className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Expected Completion Date
                </label>
                <Input
                  type="date"
                  value={toInputDate(order.expectedCompletionDate)}
                  onChange={(e) => {
                    setOrder((prev) => ({
                      ...prev,
                      expectedCompletionDate: toDisplayDate(e.target.value),
                    }));
                  }}
                  className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Delivery Mode
                </label>
                <Select
                  name="deliveryMode"
                  placeholder="Select mode"
                  options={deliveryModes}
                  styles={getStylesForSelectComponent()}
                  className="text-sm"
                  value={
                    deliveryModes.find(
                      (option) => option.value === order?.deliveryMode,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    if (!selectedOption) return;
                    setOrder((prev) => ({
                      ...prev,
                      deliveryMode: selectedOption.value,
                    }));
                  }}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Preferred Time Window
                </label>
                <Select
                  name="preferredTimeWindow"
                  placeholder="Select window"
                  options={timeWindows}
                  styles={getStylesForSelectComponent()}
                  className="text-sm"
                  value={
                    timeWindows.find(
                      (option) => option.value === order?.preferredTimeWindow,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    if (!selectedOption) return;
                    setOrder((prev) => ({
                      ...prev,
                      preferredTimeWindow: selectedOption.value,
                    }));
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* 5. Section: Offer Terms (Service Only) */}
        {isOfferType === 'SERVICE' && (
          <section className="border-b border-neutral-200 bg-white p-4">
            <span className="mb-4 block text-xs font-bold uppercase tracking-wider text-primary">
              Offer Terms & Notes
            </span>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Offer Validity <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Valid for 30 days"
                  value={order.offerValidity || ''}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      offerValidity: e.target.value,
                    }))
                  }
                  className="h-10 rounded-lg border-neutral-200 text-sm shadow-sm focus:border-primary focus:ring-primary"
                />
                {errorMsg.offerValidity && (
                  <ErrorBox msg={errorMsg.offerValidity} />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="e.g., 50% advance, 50% on completion"
                  className="min-h-[100px] resize-none rounded-lg border-neutral-200 p-3 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  value={order.paymentTermsService || ''}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      paymentTermsService: e.target.value,
                    }))
                  }
                />
                {errorMsg.paymentTermsService && (
                  <ErrorBox msg={errorMsg.paymentTermsService} />
                )}
              </div>

              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <label className="text-xs font-medium text-neutral-500">
                  Notes to Customer
                </label>
                <Textarea
                  placeholder="Any additional notes or terms..."
                  className="min-h-[100px] resize-none rounded-lg border-neutral-200 p-3 text-sm shadow-sm focus:border-primary focus:ring-primary"
                  value={order.notesToCustomer || ''}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      notesToCustomer: e.target.value,
                    }))
                  }
                />
                {errorMsg.notesToCustomer && (
                  <p className="text-sm text-red-500">
                    {errorMsg.notesToCustomer}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* 6. Sticky Footer: Summary & Actions */}
      <footer className="sticky bottom-0 z-20 -mx-4 mt-auto border-t border-neutral-200 bg-white px-4 py-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-6">
            {isOfferType === 'SERVICE' && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {translations('form.footer.discountAmount') ||
                    'Discount Amount'}
                </span>
                <span className="text-md font-bold font-semibold text-neutral-800">
                  ₹{' '}
                  {totalDiscountAmount?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div
              className={`flex flex-col gap-1 ${isOfferType === 'SERVICE' ? 'border-l border-neutral-100 pl-6' : ''}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Gross Amount
              </span>
              <span className="text-md font-bold font-semibold text-neutral-800">
                ₹{' '}
                {grossAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) && (
              <div className="flex flex-col gap-1 border-l border-neutral-100 pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  {translations('form.footer.tax_amount') || 'Tax Amount'}
                </span>
                <span className="text-md font-bold font-semibold text-blue-600">
                  ₹{' '}
                  {totalGstAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1 border-l border-neutral-100 pl-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                {translations('form.footer.total_amount') || 'Total Amount'}
              </span>
              <span className="text-md font-bold text-emerald-600">
                ₹{' '}
                {handleCalculatefinalAmount(
                  totalGstAmount,
                  grossAmount,
                ).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onCancel}>
              {translations('form.ctas.cancel')}
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={
                updateOrderMutation.isPending ||
                updateOrderForUnRepliedSalesMutation?.isPending
              }
            >
              {updateOrderMutation.isPending ||
              updateOrderForUnRepliedSalesMutation?.isPending ? (
                <div className="flex items-center gap-2">
                  <Loading className="h-4 w-4" />
                  <span>Processing...</span>
                </div>
              ) : (
                translations('form.ctas.revise')
              )}
            </Button>
          </div>
        </div>
      </footer>
    </Wrapper>
  );
};

export default EditOrderS;
