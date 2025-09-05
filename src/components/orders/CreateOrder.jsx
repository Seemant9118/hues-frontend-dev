/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { useCreateSalesColumns } from '@/components/columns/useCreateSalesColumns';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import RedirectionToInvoiceModal from '../Modals/RedirectionToInvoiceModal';
import EmptyStageComponent from '../ui/EmptyStageComponent';
import ErrorBox from '../ui/ErrorBox';
import InputWithSelect from '../ui/InputWithSelect';
import Loading from '../ui/Loading';
import SubHeader from '../ui/Sub-header';
import { Button } from '../ui/button';
import Wrapper from '../wrappers/Wrapper';

const CreateOrder = ({
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
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const orderDraft = isCreatingSales && SessionStorageService.get('orderDraft');
  const bidDraft = isCreatingPurchase && SessionStorageService.get('bidDraft');

  const router = useRouter();
  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
  const [redirectPopupOnFail, setRedirectPopUpOnFail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(
    cta === 'offer'
      ? {
          productName: orderDraft?.itemDraft?.productName || '',
          productType: orderDraft?.itemDraft?.productType || '',
          productId: orderDraft?.itemDraft?.productId || null,
          quantity: orderDraft?.itemDraft?.quantity || null,
          unitId: orderDraft?.itemDraft?.unitId || null,
          unitPrice: orderDraft?.itemDraft?.unitPrice || null,
          gstPerUnit: orderDraft?.itemDraft?.gstPerUnit || null,
          totalAmount: orderDraft?.itemDraft?.totalAmount || null,
          totalGstAmount: orderDraft?.itemDraft?.totalGstAmount || null,
        }
      : {
          productName: bidDraft?.itemDraft?.productName || '',
          productType: bidDraft?.itemDraft?.productType || '',
          productId: bidDraft?.itemDraft?.productId || null,
          quantity: bidDraft?.itemDraft?.quantity || null,
          unitId: orderDraft?.itemDraft?.unitId || null,
          unitPrice: bidDraft?.itemDraft?.unitPrice || null,
          gstPerUnit: bidDraft?.itemDraft?.gstPerUnit || null,
          totalAmount: bidDraft?.itemDraft?.totalAmount || null,
          totalGstAmount: bidDraft?.itemDraft?.totalGstAmount || null,
        },
  );

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
          invoiceType: orderDraft?.invoiceType || '',
          orderItems: orderDraft?.orderItems || [],
          bankAccountId: orderDraft?.bankAccountId || null,
          socialLinks: orderDraft?.socialLinks || null,
          remarks: orderDraft?.remarks || null,
          pin: orderDraft?.pin || null,
          billingAddressId: orderDraft?.billingAddressId || null,
          shippingAddressId: orderDraft?.shippingAddressId || null,
        }
      : {
          clientType: 'B2B',
          sellerEnterpriseId: bidDraft?.sellerEnterpriseId || null,
          buyerId: enterpriseId,
          selectedValue: bidDraft?.selectedValue || null,
          gstAmount: bidDraft?.gstAmount || null,
          amount: bidDraft?.amount || null,
          orderType: 'PURCHASE',
          invoiceType: bidDraft?.invoiceType || '',
          orderItems: bidDraft?.orderItems || [],
          bankAccountId: bidDraft?.bankAccountId || null,
          socialLinks: bidDraft?.socialLinks || null,
          remarks: bidDraft?.remarks || null,
          pin: bidDraft?.pin || null,
          billingAddressId: bidDraft?.billingAddressId || null,
          shippingAddressId: bidDraft?.shippingAddressId || null,
        },
  );

  // fetch units
  const { data: units } = useQuery({
    queryKey: [stockInOutAPIs.getUnits.endpointKey],
    queryFn: getUnits,
    select: (data) => data.data.data,
    enabled: !!enterpriseId,
  });

  // save draft to session storage
  function saveDraftToSession({ cta, data }) {
    const key = cta === 'offer' ? 'orderDraft' : 'bidDraft';
    SessionStorageService.set(key, data);
  }

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
  // for purchase-orders gst/non-gst check
  const [
    isGstApplicableForPurchaseOrders,
    setIsGstApplicableForPurchaseOrders,
  ] = useState(false);

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
      const isAccepted =
        customer?.invitation === null || customer?.invitation === undefined
          ? 'ACCEPTED'
          : customer?.invitation?.status;
      const clientId = customer?.id;
      const clientEnterpriseId = customer?.client?.id;

      return { value, label, isAccepted, clientId, clientEnterpriseId };
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
        const isAccepted =
          vendor?.invitation === null || vendor?.invitation === undefined
            ? 'ACCEPTED'
            : vendor?.invitation?.status;
        const gstNumber = vendor?.vendor?.gstNumber;

        return { value, label, isAccepted, gstNumber };
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

  const handleSetTotalAmt = () => {
    const totalAmount = order?.orderItems?.reduce((totalAmt, orderItem) => {
      return totalAmt + orderItem.totalAmount;
    }, 0);

    const totalGstAmt = order?.orderItems?.reduce((totalGst, orderItem) => {
      return (
        totalGst +
        (isGstApplicable(
          isPurchasePage
            ? isGstApplicableForPurchaseOrders
            : isGstApplicableForSalesOrders,
        )
          ? orderItem.totalGstAmount
          : 0)
      );
    }, 0);

    return { totalAmount, totalGstAmt };
  };

  const handleCalculateGrossAmt = () => {
    const grossAmount = order?.orderItems?.reduce((acc, orderItem) => {
      return acc + orderItem.totalAmount;
    }, 0);
    return grossAmount;
  };
  const grossAmt = handleCalculateGrossAmt();

  const handleCalculateTotalAmounts = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    const totalAmountWithGST = totalAmount + totalGstAmt;
    return totalAmountWithGST;
  };
  const totalAmtWithGst = handleCalculateTotalAmounts();
  const { totalGstAmt } = handleSetTotalAmt();

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();
    const isError = validation({ order, selectedItem });

    if (Object.keys(isError)?.length === 0) {
      orderMutation.mutate({
        ...order,
        buyerId: Number(order.buyerId),
        amount: parseFloat(totalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGstAmt.toFixed(2)),
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
      <SubHeader name={name}></SubHeader>
      {/* redirection to invoice modal */}
      {redirectPopupOnFail && (
        <RedirectionToInvoiceModal
          cta={cta}
          redirectPopupOnFail={redirectPopupOnFail}
          setRedirectPopUpOnFail={setRedirectPopUpOnFail}
          order={order}
          setOrder={setOrder}
        />
      )}

      <div className="flex items-center justify-between gap-4 rounded-sm border border-neutral-200 p-4">
        {cta === 'offer' ? (
          order.clientType === 'B2B' && (
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

                    const { value: id, isAccepted } = selectedOption;

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
                      });

                      saveDraftToSession({
                        cta,
                        data: {
                          ...updatedOrder,
                          selectedValue: selectedOption,
                        },
                      });

                      if (isOrder === 'invoice') {
                        setRedirectPopUpOnFail(false);
                      } else {
                        setRedirectPopUpOnFail(isAccepted !== 'ACCEPTED');
                      }
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
          )
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
                    (option) => option.value === order?.selectedValue?.value,
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
                      orderItems: [], // ❗ Clear existing order items
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

        <div className="flex w-1/2 flex-col gap-2">
          <Label className="flex gap-1">
            {translations('form.label.item_type')}
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
              if (!selectedOption) return; // Guard clause for no selection

              // Reset selected item when item type changes
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

              const updatedOrder = {
                ...order,
                invoiceType: selectedOption.value,
              };

              setOrder(updatedOrder);

              saveDraftToSession({
                cta,
                data: {
                  ...updatedOrder,
                },
              });
            }}
          />
          {errorMsg.invoiceType && <ErrorBox msg={errorMsg.invoiceType} />}
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-sm border border-neutral-200 p-4">
        <div className="flex items-center justify-between gap-4">
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
                  const selectedItemData = itemOptions?.find(
                    (item) => item.value.id === selectedOption?.value?.id,
                  )?.value;

                  if (selectedItemData) {
                    const isGstApplicableForPage = isPurchasePage
                      ? isGstApplicable(isGstApplicableForPurchaseOrders)
                      : isGstApplicable(isGstApplicableForSalesOrders);

                    const gstPerUnit = isGstApplicableForPage
                      ? selectedItemData.gstPercentage
                      : 0;

                    const updatedItem = {
                      ...selectedItem,
                      productId: selectedItemData.id,
                      productType: selectedItemData.productType,
                      unitPrice: selectedItemData.rate,
                      gstPerUnit,
                      ...(selectedItemData.productType === 'GOODS'
                        ? {
                            productName: selectedItemData.name,
                            hsnCode: selectedItemData.hsnCode,
                          }
                        : {
                            serviceName: selectedItemData.serviceName,
                            sac: selectedItemData.sacCode,
                          }),
                    };

                    setSelectedItem(updatedItem);

                    saveDraftToSession({
                      cta,
                      data: {
                        ...order,
                        itemDraft: updatedItem,
                      },
                    });
                  }
                }}
              />

              {errorMsg.orderItem && <ErrorBox msg={errorMsg.orderItem} />}
            </div>
          </div>

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
              onValueChange={(e) => {
                const inputValue = e.target.value;

                // Allow user to clear input
                if (inputValue === '') {
                  setSelectedItem((prev) => ({
                    ...prev,
                    quantity: 0,
                    totalAmount: 0,
                    totalGstAmount: 0,
                  }));
                  return;
                }

                // Prevent non-integer or negative input
                const value = Number(inputValue);

                // Reject if not a positive integer
                if (!/^\d+$/.test(inputValue) || value < 1) return;

                const totalAmt = parseFloat(
                  (value * selectedItem.unitPrice).toFixed(2),
                );
                const gstAmt = parseFloat(
                  (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                );

                const updatedItem = {
                  ...selectedItem,
                  quantity: value,
                  totalAmount: totalAmt,
                  totalGstAmount: gstAmt,
                };
                setSelectedItem(updatedItem);

                saveDraftToSession({
                  key: 'itemDraft',
                  data: {
                    ...order,
                    itemDraft: updatedItem,
                  },
                });
              }}
              unit={selectedItem.unitId} // unitId from state
              onUnitChange={(val) => {
                setSelectedItem((prev) => {
                  const updated = { ...prev, unitId: Number(val) }; // store ID
                  saveDraftToSession({ key: 'itemDraft', data: updated });
                  return updated;
                });
              }}
              units={units?.quantity} // pass the full object list
              placeholder="Enter quantity"
              unitPlaceholder="Select unit"
            />

            {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
          </div>

          <div className="flex flex-col gap-2">
            <Label className="flex gap-1">
              {translations('form.label.price')}
              <span className="text-red-600">*</span>
            </Label>
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                min={1}
                disabled={
                  (cta === 'offer' && order.buyerId == null) ||
                  order.sellerEnterpriseId == null
                }
                value={
                  selectedItem.unitPrice == null || selectedItem.unitPrice === 0
                    ? ''
                    : selectedItem.unitPrice
                }
                className="max-w-30"
                onChange={(e) => {
                  const inputValue = e.target.value;

                  // Allow user to clear input
                  if (inputValue === '') {
                    setSelectedItem((prevValue) => ({
                      ...prevValue,
                      unitPrice: 0,
                      totalAmount: 0,
                      totalGstAmount: 0,
                    }));
                    return;
                  }

                  const value = Number(inputValue);

                  // Prevent negative
                  if (value < 0) return;

                  const totalAmt = parseFloat(
                    (selectedItem.quantity * value).toFixed(2),
                  );
                  const gstAmt = parseFloat(
                    (totalAmt * (selectedItem.gstPerUnit / 100)).toFixed(2),
                  );

                  const updatedItem = {
                    ...selectedItem,
                    unitPrice: value,
                    totalAmount: totalAmt,
                    totalGstAmount: gstAmt,
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
              />

              {errorMsg.unitPrice && <ErrorBox msg={errorMsg.unitPrice} />}
            </div>
          </div>

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
                <Input
                  disabled
                  value={selectedItem.gstPerUnit || ''}
                  className="max-w-14"
                />
                {errorMsg.gstPerUnit && <ErrorBox msg={errorMsg.gstPerUnit} />}
              </div>
            </div>
          )}

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
              {errorMsg.totalAmount && <ErrorBox msg={errorMsg.totalAmount} />}
            </div>
          </div>

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
                  value={
                    (
                      (Number(selectedItem.totalAmount) || 0) +
                      (Number(selectedItem.totalGstAmount) || 0)
                    ).toFixed(2) || ''
                  }
                  className="max-w-30"
                />
                {errorMsg.totalAmount && (
                  <ErrorBox msg={errorMsg.totalAmount} />
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
                productType: '',
                productId: null,
                quantity: null,
                unitPrice: null,
                gstPerUnit: null,
                totalAmount: null,
                totalGstAmount: null,
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
                productType: '',
                productId: null,
                quantity: null,
                unitPrice: null,
                gstPerUnit: 0,
                totalAmount: null,
                totalGstAmount: null,
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
                  {grossAmt.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {translations('form.footer.tax_amount')} :{' '}
                </span>
                <span className="rounded-sm border bg-slate-100 p-2">
                  {totalGstAmt.toFixed(2)}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <span className="font-bold">
              {translations('form.footer.total_amount')} :{' '}
            </span>
            <span className="rounded-sm border bg-slate-100 p-2">
              {totalAmtWithGst.toFixed(2)}
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
    </Wrapper>
  );
};

export default CreateOrder;
