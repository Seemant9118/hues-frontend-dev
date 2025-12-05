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
import { Label } from '@/components/ui/label';
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
    <Wrapper className="relative flex h-full flex-col py-2">
      <SubHeader name={translations('title.revise')} />
      <section className="flex flex-col gap-4">
        {/* offer type ✅ */}
        <div className="grid grid-cols-4 gap-4 rounded-sm border border-neutral-200 p-4">
          <div className="flex flex-col gap-2">
            <Label>{translations('form.label.item_type')}</Label>
            <div className="rounded-md border bg-gray-100 p-2 text-sm hover:cursor-not-allowed">
              {capitalize(orderDetails?.invoiceType)}
            </div>
          </div>
        </div>
        {/* client/vendor ✅ */}
        {isOfferType === 'GOODS' ? (
          <div className="grid grid-cols-4 gap-4 rounded-sm border border-neutral-200 p-4">
            <div className="flex flex-col gap-2">
              <Label>
                {cta === 'offer'
                  ? translations('form.label.client')
                  : translations('form.label.vendor')}
              </Label>
              <div className="max-w-md rounded-md border bg-gray-100 p-2 text-sm hover:cursor-not-allowed">
                {cta === 'offer'
                  ? orderDetails?.clientName
                  : orderDetails?.vendorName}
              </div>
            </div>
          </div>
        ) : (
          // service : client/vendor details
          <div className="grid grid-cols-4 gap-4 rounded-sm border border-neutral-200 p-4">
            <div className="flex flex-col gap-2">
              <Label>
                {cta === 'offer'
                  ? translations('form.label.client')
                  : translations('form.label.vendor')}
              </Label>
              <div className="max-w-md rounded-md border bg-gray-100 p-2.5 text-sm hover:cursor-not-allowed">
                {cta === 'offer'
                  ? orderDetails?.clientName
                  : orderDetails?.vendorName}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="flex">Contact Person</Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="+91 9273872628"
                  value={order?.contactPerson || ''}
                  onChange={(e) =>
                    handleOrderChange('contactPerson', e.target.value)
                  }
                  className="max-w-30"
                />
              </div>
            </div>
            {/* client/vendor mobile */}
            <div className="flex flex-col gap-2">
              <Label className="flex">
                Mobile Number
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="+91 9273872628"
                  value={order?.mobile || ''}
                  onChange={(e) => handleOrderChange('mobile', e.target.value)}
                  className="max-w-30"
                />
                {errorMsg.mobile && <ErrorBox msg={errorMsg.mobile} />}
              </div>
            </div>
            {/* client/vendor email */}
            <div className="flex flex-col gap-2">
              <Label className="flex">
                Email
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="client@example.com"
                  value={order?.email || ''}
                  onChange={(e) => handleOrderChange('email', e.target.value)}
                  className="max-w-30"
                />
                {errorMsg.email && <ErrorBox msg={errorMsg.email} />}
              </div>
            </div>
            {/* client/vendor billing address */}
            <div className="flex flex-col gap-2">
              <Label className="flex">
                Billing Address
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="Enter billing address"
                  value={order?.billingAddressText || ''}
                  onChange={(e) =>
                    handleOrderChange('billingAddressText', e.target.value)
                  }
                  className="max-w-30"
                />
                {errorMsg.billingAddressText && (
                  <ErrorBox msg={errorMsg.billingAddressText} />
                )}
              </div>
            </div>
            {/* client/vendor service location */}
            <div className="flex flex-col gap-2">
              <Label className="flex">Service Location</Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="If different from billing"
                  value={order?.serviceLocation || ''}
                  onChange={(e) =>
                    handleOrderChange('serviceLocation', e.target.value)
                  }
                  className="max-w-30"
                />
              </div>
            </div>
          </div>
        )}

        {/* Items/Service ✅  */}
        <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
          <div className="grid grid-cols-4 gap-2">
            {/* Items/Service ✅ */}
            <div className="flex w-full max-w-xs flex-col gap-2">
              <Label className="flex gap-1">
                {translations('form.label.item')}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
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

                    // GOODS or SERVICE specific logic
                    const updatedItem = {
                      ...selectedItem,
                      productId: selectedItemData.id,
                      productType: selectedItemData.productType, // GOODS or SERVICE
                      unitPrice:
                        selectedItemData.salesPrice ??
                        selectedItemData.rate ??
                        selectedItemData.cataloguePrice ??
                        0, // auto fallback

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

                    // Persist local state
                    setSelectedItem(updatedItem);
                  }}
                />

                {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
              </div>
            </div>

            {/* Items/Service Quantity ✅ */}
            <div className="flex flex-col gap-1">
              {isOfferType === 'GOODS' ? (
                <InputWithSelect
                  id="quantity"
                  name={translations('form.label.quantity')}
                  required={true}
                  disabled={
                    (cta === 'offer' && order.buyerId == null) ||
                    order.sellerEnterpriseId == null
                  }
                  value={
                    selectedItem.quantity == null || selectedItem.quantity === 0
                      ? ''
                      : selectedItem.quantity
                  }
                  onValueChange={handleQuantityChange}
                  unit={selectedItem.unitId}
                  onUnitChange={(val) => {
                    setSelectedItem((prev) => {
                      const updated = { ...prev, unitId: Number(val) };
                      return updated;
                    });
                  }}
                  units={units?.quantity} // todo : units for services...
                  unitPlaceholder="Select unit"
                  min={0}
                  step="any" // <-- allows decimals
                />
              ) : (
                <InputWithSelect
                  id="quantity"
                  name={translations('form.label.quantity')}
                  required={true}
                  disabled={
                    (cta === 'offer' && order.buyerId == null) ||
                    order.sellerEnterpriseId == null
                  }
                  value={
                    selectedItem.quantity == null || selectedItem.quantity === 0
                      ? ''
                      : selectedItem.quantity
                  }
                  onValueChange={handleQuantityChange}
                  unit={selectedItem.unit}
                  onUnitChange={(val) => {
                    setSelectedItem((prev) => {
                      const updated = { ...prev, unit: val };
                      return updated;
                    });
                  }}
                  units={unitForService} // todo : units for services...
                  unitPlaceholder="Select unit"
                  min={0}
                  step="any" // <-- allows decimals
                />
              )}

              {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>

            {/* Items/Service Price ✅ */}
            <div className="flex flex-col gap-2">
              <Label className="flex gap-1">
                {translations('form.label.price')}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  type="number"
                  placeholder="0.00"
                  min={1}
                  disabled={
                    (cta === 'offer' && order.buyerId == null) ||
                    order.sellerEnterpriseId == null
                  }
                  value={
                    selectedItem.unitPrice == null ||
                    selectedItem.unitPrice === 0
                      ? ''
                      : selectedItem.unitPrice
                  }
                  className="max-w-30"
                  onChange={handlePriceChange}
                />

                {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
              </div>
            </div>

            {/* Items/Service Discount ✅ */}
            {isOfferType === 'SERVICE' && (
              <div className="flex flex-col gap-2">
                <Label className="flex">
                  {translations('form.label.discount')}
                  <span className="text-xs"> (%)</span>
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    value={selectedItem.discountPercentage || 0}
                    className="max-w-30"
                    onChange={handleDiscountChange}
                  />
                  {errorMsg.discountPercentage && (
                    <ErrorBox msg={errorMsg.discountPercentage} />
                  )}
                </div>
              </div>
            )}

            {/* Items/Service GST% ✅ */}
            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) && (
              <div className="flex flex-col gap-2">
                <Label className="flex">
                  {translations('form.label.gst')}
                  <span className="text-xs"> (%)</span>
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input disabled value={selectedItem.gstPerUnit || ''} />
                  {errorMsg.gstPerUnit && (
                    <ErrorBox msg={errorMsg.gstPerUnit} />
                  )}
                </div>
              </div>
            )}
            {/* Items/Service Value ✅ */}
            <div className="flex flex-col gap-2">
              <Label className="flex gap-1">
                {isOrder === 'invoice'
                  ? translations('form.label.invoice_value')
                  : translations('form.label.value')}
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  disabled
                  value={selectedItem.totalAmount || ''}
                  className="max-w-30"
                />
                {errorMsg.totalAmount && (
                  <ErrorBox msg={errorMsg.totalAmount} />
                )}
              </div>
            </div>

            {/* Items/Service Tax amount ✅ */}
            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) && (
              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  {translations('form.label.tax_amount')}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    value={selectedItem.totalGstAmount || ''}
                    className="max-w-30"
                  />
                  {errorMsg.totalGstAmount && (
                    <ErrorBox msg={errorMsg.totalGstAmount} />
                  )}
                </div>
              </div>
            )}

            {/* Items/Service Amount ✅ */}
            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) && (
              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  {translations('form.label.amount')}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-col gap-1">
                  <Input
                    disabled
                    value={selectedItem?.finalAmount}
                    className="max-w-30"
                  />
                  {errorMsg.finalAmount && (
                    <ErrorBox msg={errorMsg.finalAmount} />
                  )}
                </div>
              </div>
            )}

            {/* Items/Service Description ✅ */}
            {isOfferType === 'SERVICE' && (
              <div className="col-span-4 flex flex-col gap-2">
                <Label className="flex gap-1">Description</Label>
                <div className="flex flex-col gap-1">
                  <Input
                    value={selectedItem.description || ''}
                    className="max-w-30"
                    onChange={(e) =>
                      setSelectedItem((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Reset selected item
                const updatedItem = {
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
                };

                setSelectedItem(updatedItem);
              }}
            >
              {translations('form.ctas.cancel')}
            </Button>
            <Button
              size="sm"
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

                // Add item to orderItems safely
                setOrder((prev) => ({
                  ...prev,
                  orderItems: [...(prev.orderItems || []), newItem],
                }));

                // Clear selected item (UI reset)
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

        {/* selected item / Edit item table */}
        <div className="scrollBarStyles min-h-42 relative flex flex-col gap-2 overflow-auto rounded-md border px-4">
          <span className="sticky top-0 z-20 w-full pt-4 font-bold">
            {translations('title.sub_titles.edit_item')}
          </span>
          {isLoading ? (
            <Loading />
          ) : (
            <div>
              <div className="rounded-[6px]">
                <Table id={orderId}>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="shrink-0 text-xs font-bold text-black">
                        {translations('form.table.header.item')}
                      </TableHead>
                      <TableHead className="shrink-0 text-xs font-bold text-black">
                        {translations('form.table.header.quantity')}
                      </TableHead>
                      <TableHead className="shrink-0 text-xs font-bold text-black">
                        {translations('form.table.header.price')}
                      </TableHead>
                      {isOfferType === 'SERVICE' && (
                        <TableHead className="shrink-0 text-xs font-bold text-black">
                          {translations('form.table.header.discount')}
                        </TableHead>
                      )}
                      {isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      ) && (
                        <TableHead className="shrink-0 text-xs font-bold text-black">
                          {translations('form.table.header.gst')}
                        </TableHead>
                      )}
                      <TableHead className="shrink-0 text-xs font-bold text-black">
                        {translations('form.table.header.value')}
                      </TableHead>
                      {isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      ) && (
                        <>
                          <TableHead className="shrink-0 text-xs font-bold text-black">
                            {translations('form.table.header.tax_amount')}
                          </TableHead>
                          <TableHead className="shrink-0 text-xs font-bold text-black">
                            {translations('form.table.header.amount')}
                          </TableHead>
                        </>
                      )}
                      <TableHead className="shrink-0 text-xs font-bold text-black"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="italic">
                    {order?.orderItems?.map((item) => (
                      <TableRow key={item.id || item.productId}>
                        {/* item name ✅ */}
                        <TableCell>
                          {item.productName || item.serviceName}
                        </TableCell>

                        {/* quantity 🔔 */}
                        <TableCell>
                          <InputWithSelect
                            required={true}
                            value={item.quantity === 0 ? '' : item.quantity}
                            onValueChange={(e) => {
                              const inputValue = e.target.value;

                              // If empty -> treat as 0 quantity
                              if (inputValue === '') {
                                handleInputChange(item, 'quantity', 0);
                                return;
                              }

                              // Allow only valid decimal numbers
                              if (!/^\d*\.?\d*$/.test(inputValue)) return;

                              // Convert to number
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
                          />
                        </TableCell>

                        {/* unitPrice ✅ */}
                        <TableCell>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleInputChange(
                                item,
                                'unitPrice',
                                e.target.value,
                              )
                            }
                            className="w-24 border-2 font-semibold"
                            placeholder="price"
                          />
                        </TableCell>

                        {/* discount ✅ */}
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
                              className="w-20 border-2 font-semibold"
                              placeholder="%"
                            />
                          </TableCell>
                        )}

                        {/* gst ✅ */}
                        {isGstApplicable(
                          isPurchasePage
                            ? isGstApplicableForPurchaseOrders
                            : isGstApplicableForSalesOrders,
                        ) && <TableCell>{item.gstPerUnit}</TableCell>}

                        {/* value ✅ */}
                        <TableCell>{`₹ ${(Number(item.totalAmount) || 0).toFixed(2)}`}</TableCell>

                        {isGstApplicable(
                          isPurchasePage
                            ? isGstApplicableForPurchaseOrders
                            : isGstApplicableForSalesOrders,
                        ) && (
                          <>
                            {/* tax amount */}
                            <TableCell>{`₹ ${(Number(item.totalGstAmount) || 0).toFixed(2)}`}</TableCell>

                            {/* total amount / finalAmount */}
                            <TableCell>{`₹ ${handleCalculatefinalAmount(item.totalGstAmount, item.totalAmount).toFixed(2)}`}</TableCell>
                          </>
                        )}

                        {/* Delete Item 🔔 */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              className="text-red-500"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setOrder((prev) => ({
                                  ...prev,
                                  // ✅ Remove item from orderItems using productId (unique)
                                  orderItems: prev.orderItems.filter(
                                    (orderItem) =>
                                      orderItem.productId !== item.productId,
                                  ),

                                  // ✅ Push id into deletedItems only if it exists
                                  deletedItems: item.id
                                    ? [...(prev.deletedItems || []), item.id]
                                    : [...(prev.deletedItems || [])],
                                }));
                              }}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Scheduling & Delivery Expectations  */}
        {isOfferType === 'SERVICE' && (
          <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
            {/* TOP ROW */}
            <div className="grid grid-cols-3 gap-6">
              {/* Expected Start Date */}
              <div className="flex flex-col gap-2">
                <Label>Expected Start Date</Label>
                <Input
                  type="date"
                  value={toInputDate(order.expectedStartDate)}
                  onChange={(e) => {
                    setOrder((prev) => ({
                      ...prev,
                      expectedStartDate: toDisplayDate(e.target.value),
                    }));
                  }}
                />
              </div>

              {/* Expected Completion Date */}
              <div className="flex flex-col gap-2">
                <Label>Expected Completion Date</Label>
                <Input
                  type="date"
                  value={toInputDate(order.expectedCompletionDate)}
                  onChange={(e) => {
                    setOrder((prev) => ({
                      ...prev,
                      expectedCompletionDate: toDisplayDate(e.target.value),
                    }));
                  }}
                />
              </div>

              {/* Delivery Mode (Custom Select) */}
              <div className="flex flex-col gap-2">
                <Label>Delivery Mode</Label>
                <Select
                  name="deliveryMode"
                  placeholder="Select mode"
                  options={deliveryModes}
                  styles={getStylesForSelectComponent()}
                  className="max-w-xs text-sm"
                  classNamePrefix="select"
                  menuPlacement="top"
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
            </div>

            {/* PREFERRED TIME WINDOW */}
            <div className="flex flex-col gap-2">
              <Label>Preferred Time Window</Label>
              <Select
                name="preferredTimeWindow"
                placeholder="Select time window"
                options={timeWindows}
                styles={getStylesForSelectComponent()}
                className="w-full text-sm"
                classNamePrefix="select"
                menuPlacement="top"
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
        )}

        {/* Offer Terms */}
        {isOfferType === 'SERVICE' && (
          <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
            {/* Offer Validity + Payment Terms */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Offer Validity */}
              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  {`Offer Validity`}
                  <span className="text-red-600">*</span>
                </Label>

                <Input
                  placeholder="e.g., Valid for 30 days"
                  value={order.offerValidity || ''}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      offerValidity: e.target.value,
                    }))
                  }
                />

                {errorMsg.offerValidity && (
                  <ErrorBox msg={errorMsg.offerValidity} />
                )}
              </div>

              {/* Payment Terms */}
              <div className="flex flex-col gap-2">
                <Label className="flex gap-1">
                  {`Payment Terms`}
                  <span className="text-red-600">*</span>
                </Label>

                <Textarea
                  placeholder="e.g., 50% advance, 50% on completion"
                  className="h-24"
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
            </div>

            {/* Notes to Customer */}
            <div className="flex flex-col gap-2">
              <Label>{`Notes to Customer`}</Label>

              <Textarea
                placeholder="Any additional notes or terms..."
                className="h-28"
                value={order.notesToCustomer || ''}
                onChange={(e) =>
                  setOrder((prev) => ({
                    ...prev,
                    notesToCustomer: e.target.value,
                  }))
                }
              />

              {errorMsg.notesToCustomer && (
                <p className="text-sm text-red-600">
                  {errorMsg.notesToCustomer}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="mt-auto h-[1px] bg-neutral-300"></div>

        {/* Footers : with info and ctas */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-2">
            {/* discount amount */}
            {isOfferType === 'SERVICE' && (
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.discountAmount')} :{' '}
                </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {totalDiscountAmount?.toFixed(2)}
                </span>
              </div>
            )}
            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) && (
              <>
                {/* net amount */}
                <div className="flex items-center gap-2">
                  <span className="font-bold">{'Gross Amount'} :</span>
                  <span className="rounded-sm border bg-slate-100 p-2">
                    {grossAmount.toFixed(2)}
                  </span>
                </div>
                {/* gst amount */}
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {translations('form.footer.tax_amount')} :{' '}
                  </span>
                  <span className="rounded-sm border bg-slate-100 p-2">
                    {totalGstAmount.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {/* total amount with gst */}
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {translations('form.footer.total_amount')} :{' '}
              </span>
              <span className="rounded-sm border bg-slate-100 p-2">
                {handleCalculatefinalAmount(
                  totalGstAmount,
                  grossAmount,
                ).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={onCancel} variant={'outline'}>
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
                <Loading />
              ) : (
                translations('form.ctas.revise')
              )}
            </Button>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default EditOrderS;
