/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { useCreateSalesColumns } from '@/components/columns/useCreateSalesColumns';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useOrderTotals from '@/hooks/useOrderTotals';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import {
  getProductCatalogue,
  getServiceCatalogue,
  getVendorProductCatalogue,
  getVendorServiceCatalogue,
} from '@/services/Catalogue_Services/CatalogueServices';
import {
  createClient,
  getClients,
} from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import {
  CreateOrderService,
  OrderDetails,
} from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import AddModal from '../Modals/AddModal';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithSelect from '../ui/InputWithSelect';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
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
  { value: 'ONSITE', label: 'On-site' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
];

const timeWindows = [
  { value: 'MOR_9_to_12', label: 'Morning (9 AM - 12 PM)' },
  { value: 'AFTERNOON_12_TO_4', label: 'Afternoon (12 PM - 4 PM)' },
  { value: 'EVENING_4_TO_7', label: 'Evening (4 PM - 7 PM)' },
  { value: 'CUSTOM', label: 'Custom Slot' },
];

const CreateOrderS = ({
  isCreatingSales,
  isCreatingPurchase,
  onCancel,
  name,
  cta,
  isOrder,
  referenceOrderId,
}) => {
  const translations = useTranslations('components.create_edit_order');

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const orderDraft = isCreatingSales && SessionStorageService.get('orderDraft');
  const bidDraft = isCreatingPurchase && SessionStorageService.get('bidDraft');

  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const [order, setOrder] = useState(
    cta === 'offer'
      ? {
          clientType: 'B2B',
          sellerEnterpriseId: enterpriseId,
          buyerId: orderDraft?.buyerId || null,
          contactPerson: orderDraft?.contactPerson || '',
          email: orderDraft?.email || '',
          mobile: orderDraft?.mobile || '',
          serviceLocation: orderDraft?.serviceLocation || '',
          selectedValue: orderDraft?.selectedValue || null,
          gstAmount: orderDraft?.gstAmount || null,
          amount: orderDraft?.amount || null,
          orderType: 'SALES',
          invoiceType: orderDraft?.invoiceType || '',
          orderItems: orderDraft?.orderItems || [],
          expectedStartDate: orderDraft?.expectedStartDate || '',
          expectedCompletionDate: orderDraft?.expectedCompletionDate || '',
          deliveryMode: orderDraft?.deliveryMode || '',
          timeWindow: orderDraft?.timeWindow || '',
        }
      : {
          clientType: 'B2B',
          sellerEnterpriseId: bidDraft?.sellerEnterpriseId || null,
          buyerId: enterpriseId,
          contactPerson: bidDraft?.contactPerson || '',
          email: bidDraft?.email || '',
          mobile: bidDraft?.mobile || '',
          serviceLocation: bidDraft?.serviceLocation || '',
          selectedValue: bidDraft?.selectedValue || null,
          gstAmount: bidDraft?.gstAmount || null,
          amount: bidDraft?.amount || null,
          orderType: 'PURCHASE',
          invoiceType: bidDraft?.invoiceType || '',
          orderItems: bidDraft?.orderItems || [],
          expectedStartDate: bidDraft?.expectedStartDate || '',
          expectedCompletionDate: bidDraft?.expectedCompletionDate || '',
          deliveryMode: bidDraft?.deliveryMode || '',
          timeWindow: bidDraft?.timeWindow || '',
        },
  );

  // important keys : to condition rendering form
  const isOfferType = order?.invoiceType;

  const [selectedItem, setSelectedItem] = useState(
    cta === 'offer'
      ? {
          productName: orderDraft?.itemDraft?.productName || '',
          productType: orderDraft?.itemDraft?.productType || '',
          productId: orderDraft?.itemDraft?.productId || null,
          quantity: orderDraft?.itemDraft?.quantity || null,
          unitPrice: orderDraft?.itemDraft?.unitPrice || null,
          unitId:
            isOfferType === 'GOODS'
              ? orderDraft?.itemDraft?.unitId || null
              : null,
          discountPercentage:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.discountPercentage || null
              : null,
          discountAmount:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.discountPercentage || null
              : null,
          unit:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.unit || null
              : null,
          description:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.description || null
              : null,
          gstPerUnit: orderDraft?.itemDraft?.gstPerUnit || null,
          totalAmount: orderDraft?.itemDraft?.totalAmount || null,
          totalGstAmount: orderDraft?.itemDraft?.totalGstAmount || null,
          finalAmount: orderDraft?.itemDraft?.finalAmount || null,
        }
      : {
          productName: bidDraft?.itemDraft?.productName || '',
          productType: bidDraft?.itemDraft?.productType || '',
          productId: bidDraft?.itemDraft?.productId || null,
          quantity: bidDraft?.itemDraft?.quantity || null,
          unitPrice: bidDraft?.itemDraft?.unitPrice || null,
          unitId:
            isOfferType === 'GOODS'
              ? orderDraft?.itemDraft?.unitId || null
              : null,
          discountPercentage:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.discountPercentage || null
              : null,
          unit:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.unit || null
              : null,
          description:
            isOfferType === 'SERVICE'
              ? orderDraft?.itemDraft?.description || null
              : null,
          discount: orderDraft?.itemDraft?.discount || null,
          gstPerUnit: bidDraft?.itemDraft?.gstPerUnit || null,
          totalAmount: bidDraft?.itemDraft?.totalAmount || null,
          totalGstAmount: bidDraft?.itemDraft?.totalGstAmount || null,
          finalAmount: bidDraft?.itemDraft?.finalAmount || null,
        },
  );
  // for purchase-orders gst/non-gst check
  const [
    isGstApplicableForPurchaseOrders,
    setIsGstApplicableForPurchaseOrders,
  ] = useState(false);

  // save draft to session storage
  function saveDraftToSession({ cta, data }) {
    const key = cta === 'offer' ? 'orderDraft' : 'bidDraft';
    SessionStorageService.set(key, data);
  }

  // Convert DD/MM/YYYY → YYYY-MM-DD
  const toInputDate = (dateStr) => {
    if (!dateStr) return '';
    const [dd, mm, yyyy] = dateStr.split('/');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Convert YYYY-MM-DD → DD/MM/YYYY
  const toDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const [yyyy, mm, dd] = dateStr.split('-');
    return `${dd}/${mm}/${yyyy}`;
  };

  // [GST/NON-GST Checking]
  // fetch profileDetails API
  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
    enabled: !!isCreatingSales && isPurchasePage === false,
  });
  // for sales-order gst/non-gst check
  const isGstApplicableForSalesOrders =
    isPurchasePage === false && !!profileDetails?.enterpriseDetails?.gstNumber;

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

    saveDraftToSession({
      cta,
      data: updatedOrder,
    });
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
      saveDraftToSession({ cta, data: { ...order, itemDraft: cleared } });
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
    saveDraftToSession({ cta, data: { ...order, itemDraft: calculated } });
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
      saveDraftToSession({ cta, data: { ...order, itemDraft: cleared } });
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
    saveDraftToSession({ cta, data: { ...order, itemDraft: calculated } });
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

    saveDraftToSession({
      cta,
      data: { ...order, itemDraft: updated },
    });
  };

  // fetch units - GOODS
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId && isOfferType === 'GOODS',
  });

  // fetched referenced order details
  const { data: referencedOrderData } = useQuery({
    queryKey: [orderApi.getOrderDetails.endpointKey, referenceOrderId],
    queryFn: () => OrderDetails(referenceOrderId),
    enabled: !!referenceOrderId,
    select: (data) => data.data.data,
  });

  useEffect(() => {
    if (referencedOrderData) {
      const orderDetails = referencedOrderData;

      // ⬇️ Flatten and transform orderItems
      const flattenedOrderItems = (orderDetails?.orderItems || []).map(
        (item) => {
          const { productDetails } = item;

          return {
            productId: productDetails.id,
            productName: productDetails?.productName,
            productType: item.productType,
            quantity: item.quantity,
            unitId: item.unitId,
            unitPrice: item.unitPrice,
            gstPerUnit: item.gstPerUnit,
            totalAmount: item.totalAmount,
            totalGstAmount: item.totalGstAmount,
            hsnCode: productDetails?.hsnCode,
            serviceName: productDetails?.serviceName,
            sac:
              item.productType === 'SERVICES'
                ? productDetails?.sacCode
                : undefined,
            // Add any other fields you want to bring up
          };
        },
      );

      setOrder((prevOrder) => ({
        ...prevOrder,
        sellerEnterpriseId: orderDetails?.sellerEnterpriseId,
        buyerId: orderDetails?.buyerId,
        invoiceType: orderDetails?.invoiceType,
        orderItems: flattenedOrderItems, // ⬅️ Use transformed array
        amount: orderDetails?.amount,
        gstAmount: orderDetails?.gstAmount,
        referenceOrderId: Number(referenceOrderId),
      }));
    }
  }, [referencedOrderData]);

  useEffect(() => {
    if (!isCreatingPurchase || !order?.selectedValue) return;
    // Check if GST is applicable for purchase orders
    const gstNumber = order?.selectedValue?.gstNumber;
    setIsGstApplicableForPurchaseOrders(!!gstNumber);
  }, [isCreatingPurchase, order?.selectedValue]);

  // [clients]
  // clients[B2B] fetching
  const { data: customerData } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
    enabled: cta === 'offer' && isCreatingSales && order.clientType === 'B2B',
  });
  // client options
  const clientOptions = [
    ...(customerData?.map((customer) => {
      const value = customer?.client?.id || customer?.id;
      const label =
        customer?.client?.name || customer.invitation?.userDetails?.name;
      const data = customer?.client || customer?.invitation?.userDetails;
      const isAccepted =
        customer?.invitation === null || customer?.invitation === undefined
          ? 'ACCEPTED'
          : customer?.invitation?.status;
      const clientId = customer?.id;
      const clientEnterpriseId = customer?.client?.id;
      const isEnterpriseActive = !!customer?.client?.id; // it only checks enterprise is on platform or not

      return {
        value,
        label,
        data,
        isAccepted,
        clientId,
        clientEnterpriseId,
        isEnterpriseActive,
      };
    }) ?? []),
    {
      value: 'add-new-client', // Special value for "Add New Client"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('form.input.client.add_new_client')}
        </span>
      ),
      isAccepted: 'ACCEPTED',
    },
  ];

  // [vendors]
  // vendors fetching
  const { data: vendorData } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
    enabled: cta === 'bid' && isCreatingPurchase && order.clientType === 'B2B',
  });
  // vendors options
  const vendorOptions = [
    ...(
      vendorData?.filter(
        (vendor) => vendor?.vendor?.name && vendor?.vendor?.id !== null, // Filter valid vendors
      ) ?? []
    ) // Fallback to empty array if vendorData is undefined or null
      .map((vendor) => {
        const value = vendor?.vendor?.id || vendor?.id;
        const label =
          vendor?.vendor?.name || vendor.invitation?.userDetails?.name;
        const data = vendor?.vendor || vendor?.invitation?.userDetails;
        const isAccepted =
          vendor?.invitation === null || vendor?.invitation === undefined
            ? 'ACCEPTED'
            : vendor?.invitation?.status;
        const gstNumber = vendor?.vendor?.gstNumber;

        return { value, label, data, isAccepted, gstNumber };
      }),
    // Special option for "Add New Vendor"
    {
      value: 'add-new-vendor', // Special value for "Add New Vendor"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('form.input.vendor.add_new_vendor')}
        </span>
      ),
      isAccepted: 'ACCEPTED',
      gstNumber: null, // Add any extra properties if needed
    },
  ];

  // [item type]
  const itemTypeOptions = [
    {
      value: 'GOODS',
      label: translations('form.input.item_type.goods'),
    },
    {
      value: 'SERVICE',
      label: translations('form.input.item_type.services'),
    },
  ];

  // Items fetching
  // util fn to check it item is already present in orderItems or not?
  const isItemAlreadyAdded = (itemId) =>
    order.orderItems?.some((item) => item.productId === itemId);

  // [Client's Goods and Services]
  // client's catalogue's goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [catalogueApis.getProductCatalogue.endpointKey, enterpriseId],
    queryFn: () => getProductCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'GOODS',
  });
  // client's goods options
  const clientsGoodsOptions = goodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id); // disable if already added

    return { value, label, disabled };
  });
  // client catalogue services fetching
  const { data: servicesData } = useQuery({
    queryKey: [catalogueApis.getServiceCatalogue.endpointKey, enterpriseId],
    queryFn: () => getServiceCatalogue(enterpriseId),
    select: (res) => res.data.data,
    enabled: cta === 'offer' && order.invoiceType === 'SERVICE',
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
  // itemClientListingOptions on the basis of item type
  const itemClientListingOptions =
    order.invoiceType === 'GOODS'
      ? clientsGoodsOptions
      : clientsServicesOptions;

  // [Vendor's Goods and Services]
  // vendor catalogue goods fetching
  const { data: vendorGoodsData } = useQuery({
    queryKey: [
      catalogueApis.getVendorProductCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorProductCatalogue(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled:
      isPurchasePage &&
      order.invoiceType === 'GOODS' &&
      !!order.sellerEnterpriseId,
  });
  // vendor's goods options
  const vendorGoodsOptions = vendorGoodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id); // disable if already added

    return { value, label, disabled };
  });
  // vendor's catalogue services fetching
  const { data: vendorServicesData } = useQuery({
    queryKey: [
      catalogueApis.getVendorServiceCatalogue.endpointKey,
      order.sellerEnterpriseId,
    ],
    queryFn: () => getVendorServiceCatalogue(order.sellerEnterpriseId),
    select: (res) => res.data.data,
    enabled:
      isPurchasePage &&
      order.invoiceType === 'SERVICE' &&
      !!order.sellerEnterpriseId,
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
  // itemVendorListingOptions on the basis of item type
  const itemVendorListingOptions =
    order.invoiceType === 'GOODS' ? vendorGoodsOptions : vendorServiceOptions;

  // mutation - create order
  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: (res) => {
      toast.success(
        cta === 'offer'
          ? translations('form.successMsg.offer_created_successfully')
          : translations('form.successMsg.bid_created_successfully'),
      );
      if (isPurchasePage) {
        router.push(`/dashboard/purchases/purchase-orders/${res.data.data.id}`);
        setOrder({
          clientType: 'B2B',
          sellerEnterpriseId: bidDraft?.sellerEnterpriseId || null,
          buyerId: enterpriseId,
          selectedValue: null,
          gstAmount: null,
          amount: null,
          orderType: 'PURCHASE',
          invoiceType: '',
          orderItems: [],
          bankAccountId: null,
          socialLinks: null,
          remarks: null,
          pin: null,
          billingAddressId: null,
          shippingAddressId: null,
        }); // Reset order state
        SessionStorageService.remove('bidDraft');
      } else {
        router.push(`/dashboard/sales/sales-orders/${res.data.data.id}`);
        setOrder({
          clientType: 'B2B',
          sellerEnterpriseId: enterpriseId,
          buyerId: null,
          selectedValue: null,
          gstAmount: null,
          amount: null,
          orderType: 'SALES',
          invoiceType: '',
          orderItems: [],
          bankAccountId: null,
          socialLinks: null,
          remarks: null,
          pin: null,
          billingAddressId: null,
          shippingAddressId: null,
        }); // Reset order state
        SessionStorageService.remove('orderDraft');
      }
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

  const gstApplicable = isGstApplicable(
    isPurchasePage
      ? isGstApplicableForPurchaseOrders
      : isGstApplicableForSalesOrders,
  );

  const { grossAmount, totalDiscountAmount, totalGstAmount, finalAmount } =
    useOrderTotals(order?.orderItems || [], gstApplicable);

  // handling submit fn
  const handleSubmit = () => {
    // const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError)?.length === 0) {
      orderMutation.mutate({
        ...order,
        buyerId: Number(order.buyerId),
        discountAmount: parseFloat(totalDiscountAmount.toFixed(2)),
        amount: parseFloat(grossAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmount.toFixed(2)),
      });
      setErrorMsg({});
    } else {
      setErrorMsg(isError);
    }
  };

  const itemOptions =
    cta === 'offer' ? itemClientListingOptions : itemVendorListingOptions;

  // ⬇️ Memoized selected option based on selectedItem.productId
  const selectedOption = useMemo(() => {
    if (!selectedItem?.productId) return null;

    return (
      itemOptions?.find(
        (item) => String(item.value.id) === String(selectedItem.productId),
      ) ?? null
    );
  }, [selectedItem?.productId, itemOptions]);

  // columns
  const createSalesColumns = useCreateSalesColumns(
    isOrder,
    isOfferType,
    setOrder,
    setSelectedItem,
    isPurchasePage,
    isGstApplicableForSalesOrders,
    isGstApplicableForPurchaseOrders,
  );

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
      <SubHeader name={name} />
      <section className="flex flex-col gap-4">
        {/* offer type */}
        <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
          <div className="flex w-1/2 flex-col gap-2">
            <Label className="flex gap-1">
              {'Offer Type'}
              <span className="text-red-600">*</span>
            </Label>
            <Select
              name="itemType"
              placeholder={translations('form.input.item_type.placeholder')}
              options={itemTypeOptions}
              styles={getStylesForSelectComponent()}
              className="max-w-xs text-sm"
              classNamePrefix="select"
              value={
                itemTypeOptions.find(
                  (option) => option.value === order.invoiceType,
                ) || null
              }
              onChange={(selectedOption) => {
                if (!selectedOption) return;

                // 1. Reset selectedItem
                setSelectedItem({
                  productName: '',
                  productType: '',
                  productId: null,
                  quantity: null,
                  unitPrice: null,
                  unitId: null,
                  discountPercentage: null,
                  unit: null,
                  description: null,
                  gstPerUnit: null,
                  totalAmount: null,
                  totalGstAmount: null,
                });

                // 2. Create updated order object
                const updatedOrder = {
                  ...order,
                  // --- ONLY UPDATED FIELD ---
                  invoiceType: selectedOption.value,
                  // --- RESET ONLY DYNAMIC FIELDS ---
                  buyerId: cta === 'offer' ? null : order?.buyerId,
                  mobile: '',
                  contactPerson: '',
                  email: '',
                  serviceLocation: '',
                  sellerEnterpriseId:
                    cta === 'offer' ? order?.sellerEnterpriseId : null,
                  gstAmount: null,
                  amount: null,
                  orderItems: [],
                  selectedValue: '',
                };

                setOrder(updatedOrder);

                // 3. Save to session
                saveDraftToSession({
                  cta,
                  data: updatedOrder,
                });
              }}
            />
            {errorMsg.invoiceType && <ErrorBox msg={errorMsg.invoiceType} />}
          </div>
        </div>
        {/* client/vendor */}
        {isOfferType === 'GOODS' ? (
          // goods : client/vendor details
          <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
            {cta === 'offer' ? (
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="flex gap-1">
                  {translations('form.label.client')}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex w-full flex-col gap-1">
                  <Select
                    name="clients"
                    placeholder={translations('form.input.client.placeholder')}
                    options={clientOptions}
                    styles={getStylesForSelectComponent()}
                    className="max-w-xs text-sm"
                    classNamePrefix="select"
                    value={
                      clientOptions?.find(
                        (option) => option.value === order?.buyerId,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      if (!selectedOption) return; // Guard clause

                      setSelectedItem({
                        productName: '',
                        productType: '',
                        productId: null,
                        quantity: null,
                        unitPrice: null,
                        gstPerUnit: null,
                        totalAmount: null,
                        totalGstAmount: null,
                      });

                      const { value: id, isEnterpriseActive } = selectedOption;

                      if (id === 'add-new-client') {
                        setIsModalOpen(true);
                      } else {
                        const updatedOrder = {
                          ...order,
                          buyerId: id,
                          orderItems: [],
                        };

                        setOrder({
                          ...updatedOrder,
                          selectedValue: selectedOption,
                          buyerType: isEnterpriseActive
                            ? 'ENTERPRISE'
                            : 'UNCONFIRMED_ENTERPRISE',
                        });

                        saveDraftToSession({
                          cta,
                          data: {
                            ...updatedOrder,
                            selectedValue: selectedOption,
                          },
                        });
                      }
                    }}
                  />

                  {/* Conditionally render the AddModal when "Add New Client" is selected */}
                  {isModalOpen && (
                    <AddModal
                      type="Add"
                      cta="client"
                      btnName="Add a new Client"
                      mutationFunc={createClient}
                      isOpen={isModalOpen}
                      setIsOpen={setIsModalOpen}
                    />
                  )}
                  {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
                </div>
              </div>
            ) : (
              <div className="flex w-1/2 flex-col gap-2">
                <Label className="flex gap-1">
                  {translations('form.label.vendor')}
                  <span className="text-red-600">*</span>
                </Label>
                <div className="flex w-full flex-col gap-1">
                  <Select
                    name="vendors"
                    placeholder={translations('form.input.vendor.placeholder')}
                    options={vendorOptions}
                    styles={getStylesForSelectComponent()}
                    className="max-w-xs text-sm"
                    classNamePrefix="select"
                    value={
                      vendorOptions?.find(
                        (option) =>
                          option.value === order?.selectedValue?.value,
                      ) || null
                    } // Match selected value
                    onChange={(selectedOption) => {
                      if (!selectedOption) return; // Guard clause for no selection

                      setSelectedItem({
                        productName: '',
                        productType: '',
                        productId: null,
                        quantity: null,
                        unitPrice: null,
                        gstPerUnit: null,
                        totalAmount: null,
                        totalGstAmount: null,
                      }); // Reset selected item

                      const { value: id, gstNumber } = selectedOption; // Extract id and isAccepted from the selected option

                      // Check if "Add New vendor" is selected
                      if (selectedOption.value === 'add-new-vendor') {
                        setIsModalOpen(true); // Open the modal when "Add New Vendor" is selected
                      } else {
                        setIsGstApplicableForPurchaseOrders(!!gstNumber); // setting gstNumber for check gst/non-gst vendor

                        const updatedOrder = {
                          ...order,
                          sellerEnterpriseId: id,
                          orderItems: [], // Clear existing order items
                        };

                        setOrder({
                          ...updatedOrder,
                          selectedValue: selectedOption,
                        }); // Update selected value

                        saveDraftToSession({
                          cta,
                          data: {
                            ...updatedOrder,
                            selectedValue: selectedOption,
                          },
                        });
                      }
                    }}
                  />

                  {/* Conditionally render the AddModal when "Add New Client" is selected */}
                  {isModalOpen && (
                    <AddModal
                      type="Add"
                      cta="vendor"
                      btnName="Add a new Vendor"
                      mutationFunc={createVendor}
                      isOpen={isModalOpen}
                      setIsOpen={setIsModalOpen}
                    />
                  )}
                  {errorMsg.sellerEnterpriseId && (
                    <ErrorBox msg={errorMsg.sellerEnterpriseId} />
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // service : client/vendor details
          <div className="grid grid-cols-4 gap-4 rounded-sm border border-neutral-200 p-4">
            <div>
              {/* client/vendor */}
              {cta === 'offer' ? (
                <div className="flex flex-col gap-2">
                  <Label className="flex gap-1">
                    {translations('form.label.client')}
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex w-full flex-col gap-1">
                    <Select
                      name="clients"
                      placeholder={translations(
                        'form.input.client.placeholder',
                      )}
                      options={clientOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-xs text-sm"
                      classNamePrefix="select"
                      value={
                        clientOptions?.find(
                          (option) => option.value === order?.buyerId,
                        ) || null
                      }
                      onChange={(selectedOption) => {
                        if (!selectedOption) return; // Guard clause

                        setSelectedItem({
                          productName: '',
                          productType: '',
                          productId: null,
                          quantity: null,
                          unitPrice: null,
                          gstPerUnit: null,
                          totalAmount: null,
                          totalGstAmount: null,
                        });

                        const {
                          value: id,
                          isEnterpriseActive,
                          data,
                        } = selectedOption;

                        if (id === 'add-new-client') {
                          setIsModalOpen(true);
                        } else {
                          const updatedOrder = {
                            ...order,
                            buyerId: id,
                            mobile: data?.mobileNumber,
                            email: data?.email,
                            orderItems: [],
                          };

                          setOrder({
                            ...updatedOrder,
                            selectedValue: selectedOption,
                            buyerType: isEnterpriseActive
                              ? 'ENTERPRISE'
                              : 'UNCONFIRMED_ENTERPRISE',
                          });

                          saveDraftToSession({
                            cta,
                            data: {
                              ...updatedOrder,
                              selectedValue: selectedOption,
                            },
                          });
                        }
                      }}
                    />

                    {/* Conditionally render the AddModal when "Add New Client" is selected */}
                    {isModalOpen && (
                      <AddModal
                        type="Add"
                        cta="client"
                        btnName="Add a new Client"
                        mutationFunc={createClient}
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                      />
                    )}
                    {errorMsg.buyerId && <ErrorBox msg={errorMsg.buyerId} />}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label className="flex gap-1">
                    {translations('form.label.vendor')}
                    <span className="text-red-600">*</span>
                  </Label>
                  <div className="flex w-full flex-col gap-1">
                    <Select
                      name="vendors"
                      placeholder={translations(
                        'form.input.vendor.placeholder',
                      )}
                      options={vendorOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-xs text-sm"
                      classNamePrefix="select"
                      value={
                        vendorOptions?.find(
                          (option) =>
                            option.value === order?.selectedValue?.value,
                        ) || null
                      } // Match selected value
                      onChange={(selectedOption) => {
                        if (!selectedOption) return; // Guard clause for no selection

                        setSelectedItem({
                          productName: '',
                          productType: '',
                          productId: null,
                          quantity: null,
                          unitPrice: null,
                          gstPerUnit: null,
                          totalAmount: null,
                          totalGstAmount: null,
                        }); // Reset selected item

                        const { value: id, data, gstNumber } = selectedOption; // Extract id and isAccepted from the selected option

                        // Check if "Add New vendor" is selected
                        if (selectedOption.value === 'add-new-vendor') {
                          setIsModalOpen(true); // Open the modal when "Add New Vendor" is selected
                        } else {
                          setIsGstApplicableForPurchaseOrders(!!gstNumber); // setting gstNumber for check gst/non-gst vendor

                          const updatedOrder = {
                            ...order,
                            sellerEnterpriseId: id,
                            mobile: data?.mobileNumber,
                            email: data?.email,
                            orderItems: [], // Clear existing order items
                          };

                          setOrder({
                            ...updatedOrder,
                            selectedValue: selectedOption,
                          }); // Update selected value

                          saveDraftToSession({
                            cta,
                            data: {
                              ...updatedOrder,
                              selectedValue: selectedOption,
                            },
                          });
                        }
                      }}
                    />

                    {/* Conditionally render the AddModal when "Add New Client" is selected */}
                    {isModalOpen && (
                      <AddModal
                        type="Add"
                        cta="vendor"
                        btnName="Add a new Vendor"
                        mutationFunc={createVendor}
                        isOpen={isModalOpen}
                        setIsOpen={setIsModalOpen}
                      />
                    )}
                    {errorMsg.sellerEnterpriseId && (
                      <ErrorBox msg={errorMsg.sellerEnterpriseId} />
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* client/vendor contact person */}
            <div className="flex flex-col gap-2">
              <Label className="flex">
                Contact Person
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
            {/* client/vendor service location */}
            <div className="flex flex-col gap-2">
              <Label className="flex">
                Service Location
                <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-col gap-1">
                <Input
                  placeholder="If different from billing"
                  value={order?.serviceLocation || ''}
                  onChange={(e) =>
                    handleOrderChange('serviceLocation', e.target.value)
                  }
                  className="max-w-30"
                />
                {errorMsg.serviceLocation && (
                  <ErrorBox msg={errorMsg.serviceLocation} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Items/Service */}
        <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
          <div className="grid grid-cols-4 gap-2">
            {/* Items/Service */}
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

                    // Save in session draft
                    saveDraftToSession({
                      cta,
                      data: {
                        ...order,
                        itemDraft: updatedItem,
                      },
                    });
                  }}
                />

                {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
              </div>
            </div>

            {/* Items/Service Quantity */}
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
                      saveDraftToSession({
                        cta,
                        data: {
                          ...order,
                          itemDraft: updated,
                        },
                      });
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
                      saveDraftToSession({
                        cta,
                        data: {
                          ...order,
                          itemDraft: updated,
                        },
                      });
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

            {/* Items/Service Price */}
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

            {/* Items/Service Discount */}
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

            {/* Items/Service GST% */}
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
            {/* Items/Service Value */}
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

            {/* Items/Service Tax amount */}
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

            {/* Items/Service Amount */}
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

            {/* Items/Service Description */}
            {isOfferType === 'SERVICE' && (
              <div className="col-span-4 flex flex-col gap-2">
                <Label className="flex gap-1">
                  Description
                  <span className="text-red-600">*</span>
                </Label>
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
                  {errorMsg.description && (
                    <ErrorBox msg={errorMsg.description} />
                  )}
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

                saveDraftToSession({
                  cta,
                  data: {
                    ...order,
                    itemDraft: updatedItem,
                  },
                });
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
                const updatedOrderItems = [
                  ...(order?.orderItems || []),
                  {
                    ...selectedItem,
                    gstPercentage: selectedItem.gstPerUnit ?? 0,
                    gstPerUnit: selectedItem.gstPerUnit ?? 0,
                  },
                ];

                const updatedOrder = {
                  ...order,
                  orderItems: updatedOrderItems,
                };

                setOrder(updatedOrder);

                // Clear the selected item (itemDraft in UI)
                const clearedItem = {
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
                setSelectedItem(clearedItem);

                // Maintain updated session storage without itemDraft
                const key = cta === 'offer' ? 'orderDraft' : 'bidDraft';
                const { itemDraft, ...rest } =
                  SessionStorageService.get(key) || {};
                saveDraftToSession({
                  cta,
                  data: {
                    ...rest,
                    ...updatedOrder,
                  },
                });

                setErrorMsg({});
              }}
              variant="blue_outline"
            >
              {translations('form.ctas.add')}
            </Button>
          </div>
        </div>
        {/* selected item table */}
        <DataTable data={order.orderItems} columns={createSalesColumns} />

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
                      (option) => option.value === order.deliveryMode,
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
                name="timeWindow"
                placeholder="Select time window"
                options={timeWindows}
                styles={getStylesForSelectComponent()}
                className="w-full text-sm"
                classNamePrefix="select"
                menuPlacement="top"
                value={
                  timeWindows.find(
                    (option) => option.value === order.timeWindow,
                  ) || null
                }
                onChange={(selectedOption) => {
                  if (!selectedOption) return;
                  setOrder((prev) => ({
                    ...prev,
                    timeWindow: selectedOption.value,
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
                  <p className="text-sm text-red-600">
                    {errorMsg.offerValidity}
                  </p>
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
                  value={order.paymentTerms || ''}
                  onChange={(e) =>
                    setOrder((prev) => ({
                      ...prev,
                      paymentTerms: e.target.value,
                    }))
                  }
                />

                {errorMsg.paymentTerms && (
                  <p className="text-sm text-red-600">
                    {errorMsg.paymentTerms}
                  </p>
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
            {isGstApplicable(
              isPurchasePage
                ? isGstApplicableForPurchaseOrders
                : isGstApplicableForSalesOrders,
            ) && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    {translations('form.footer.gross_amount')} :
                  </span>
                  <span className="rounded-sm border bg-slate-100 p-2">
                    {grossAmount.toFixed(2)}
                  </span>
                </div>
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
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {translations('form.footer.total_amount')} :{' '}
              </span>
              <span className="rounded-sm border bg-slate-100 p-2">
                {finalAmount.toFixed(2)}
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
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? (
                <Loading />
              ) : (
                translations('form.ctas.create')
              )}
            </Button>
          </div>
        </div>
      </section>
    </Wrapper>
  );
};

export default CreateOrderS;
