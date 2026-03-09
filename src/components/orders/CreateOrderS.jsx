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
  getVendorProductCatalogue,
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
import Wrapper from '../wrappers/Wrapper';

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
          selectedValue: orderDraft?.selectedValue || null,
          gstAmount: orderDraft?.gstAmount || null,
          amount: orderDraft?.amount || null,
          orderType: 'SALES',
          invoiceType: 'GOODS',
          orderItems: orderDraft?.orderItems || [],
          notesToCustomer: orderDraft?.notesToCustomer || '',
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
        },
  );

  // important keys : to condition rendering form
  const isOfferType = order?.invoiceType;

  const [selectedItem, setSelectedItem] = useState(
    cta === 'offer'
      ? {
          productName: orderDraft?.itemDraft?.productName || '',
          productType: 'GOODS',
          productId: orderDraft?.itemDraft?.productId || null,
          quantity: orderDraft?.itemDraft?.quantity || null,
          unitPrice: orderDraft?.itemDraft?.unitPrice || null,
          unitId: orderDraft?.itemDraft?.unitId || null,
          gstPerUnit: orderDraft?.itemDraft?.gstPerUnit || null,
          totalAmount: orderDraft?.itemDraft?.totalAmount || null,
          totalGstAmount: orderDraft?.itemDraft?.totalGstAmount || null,
          finalAmount: orderDraft?.itemDraft?.finalAmount || null,
        }
      : {
          productName: bidDraft?.itemDraft?.productName || '',
          productType: 'GOODS',
          productId: bidDraft?.itemDraft?.productId || null,
          quantity: bidDraft?.itemDraft?.quantity || null,
          unitPrice: bidDraft?.itemDraft?.unitPrice || null,
          unitId: bidDraft?.itemDraft?.unitId || null,
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

  const calculateItem = (item, gstApplicable) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const gst = gstApplicable ? Number(item.gstPerUnit || 0) : 0;

    // Base value
    const baseValue = qty * price;

    // GST
    const gstAmount = (baseValue * gst) / 100;

    // Final Amount
    const finalAmount = baseValue + gstAmount;

    return {
      ...item,
      discountPercentage: 0,
      discountAmount: 0,
      totalAmount: Number(baseValue.toFixed(2)),
      totalGstAmount: Number(gstAmount.toFixed(2)),
      finalAmount: Number(finalAmount.toFixed(2)),
    };
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
      isGstApplicable(
        isPurchasePage
          ? isGstApplicableForPurchaseOrders
          : isGstApplicableForSalesOrders,
      ),
    );

    setSelectedItem(calculated);
    saveDraftToSession({ cta, data: { ...order, itemDraft: calculated } });
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
            sac: undefined,
            // Add any other fields you want to bring up
          };
        },
      );

      setOrder((prevOrder) => ({
        ...prevOrder,
        sellerEnterpriseId: orderDetails?.sellerEnterpriseId,
        buyerId: orderDetails?.buyerId,
        invoiceType: 'GOODS',
        orderItems: flattenedOrderItems,
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
    enabled: cta === 'offer' && isOfferType === 'GOODS',
  });
  // client's goods options
  const clientsGoodsOptions = goodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id); // disable if already added

    return { value, label, disabled };
  });

  // itemClientListingOptions on the basis of item type
  const itemClientListingOptions = clientsGoodsOptions;

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
      isPurchasePage && isOfferType === 'GOODS' && !!order.sellerEnterpriseId,
  });
  // vendor's goods options
  const vendorGoodsOptions = vendorGoodsData?.map((good) => {
    const value = { ...good, productType: 'GOODS', productName: good.name };
    const label = good.name;
    const disabled = isItemAlreadyAdded(good.id); // disable if already added

    return { value, label, disabled };
  });

  // itemVendorListingOptions on the basis of item type
  const itemVendorListingOptions = vendorGoodsOptions;

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
          invoiceType: 'GOODS',
          orderItems: [],
          bankAccountId: null,
          socialLinks: null,
          remarks: null,
          pin: null,
          billingAddressId: null,
          billingAddressText: '',
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
          invoiceType: 'GOODS',
          orderItems: [],
          bankAccountId: null,
          socialLinks: null,
          remarks: null,
          pin: null,
          billingAddressId: null,
          billingAddressText: '',
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

  const { grossAmount, totalGstAmount, finalAmount } = useOrderTotals(
    order?.orderItems || [],
    gstApplicable,
  );

  // handling submit fn
  const handleSubmit = () => {
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError)?.length > 0) {
      setErrorMsg(isError);
      return;
    }

    // Safe parsed numbers
    const parsedAmount = Number(grossAmount.toFixed(2)) || 0;
    const parsedGst = Number(totalGstAmount.toFixed(2)) || 0;

    let payload = {};

    // GOODS OFFER → Send ONLY these fields
    payload = {
      clientType: order.clientType,
      sellerEnterpriseId: order.sellerEnterpriseId,
      buyerId: Number(order.buyerId),
      selectedValue: order.selectedValue || null,
      gstAmount: parsedGst,
      amount: parsedAmount,
      orderType: order.orderType,
      invoiceType: 'GOODS',

      orderItems: [...order.orderItems],

      bankAccountId: null,
      socialLinks: null,
      remarks: order.remarks || null,
      pin: null,
      billingAddressId: order.billingAddressId || null,
      shippingAddressId: order.shippingAddressId || null,
      buyerType: order.buyerType,
    };

    // API Call
    orderMutation.mutate(payload);

    setErrorMsg({});
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
        {/* client/vendor */}
        {isOfferType === 'GOODS' && (
          // goods : client/vendor details
          <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
            {cta === 'offer' && (
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
            )}
            {cta !== 'offer' && (
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

                    // GOODS specific logic
                    const updatedItem = {
                      ...selectedItem,
                      productId: selectedItemData.id,
                      productType: 'GOODS',
                      unitPrice:
                        selectedItemData.salesPrice ??
                        selectedItemData.rate ??
                        selectedItemData.cataloguePrice ??
                        0, // auto fallback

                      gstPerUnit,
                      productName: selectedItemData.name,
                      hsnCode: selectedItemData.hsnCode,
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
                units={units?.quantity}
                unitPlaceholder="Select unit"
                min={0}
                step="any"
              />

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
          </div>
          <div className="flex items-center justify-end gap-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Reset selected item
                const updatedItem = {
                  productName: '',
                  productType: 'GOODS',
                  productId: null,
                  quantity: null,
                  unitId: null,
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
                  productName: '',
                  productType: 'GOODS',
                  productId: null,
                  quantity: null,
                  unitId: null,
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
                    {translations('form.footer.gross_amount')} :{' '}
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
