/* eslint-disable prettier/prettier */
/* eslint-disable no-unsafe-optional-chaining */
import { catalogueApis } from '@/api/catalogue/catalogueApi';
import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { orderApi } from '@/api/order_api/order_api';
import { stockInOutAPIs } from '@/api/stockInOutApis/stockInOutAPIs';
import { userAuth } from '@/api/user_auth/Users';
import {
  checkVendorGSTApplicability,
  getEnterpriseId,
  getStylesForSelectComponent,
  isGstApplicable,
} from '@/appUtils/helperFunctions';
import { DataTable } from '@/components/table/data-table';
import { Input } from '@/components/ui/input';
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
import { OrderDetails } from '@/services/Orders_Services/Orders_Services';
import { getUnits } from '@/services/Stock_In_Stock_Out_Services/StockInOutServices';
import { getProfileDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import AddModal from '../../../Modals/AddModal';
import EmptyStageComponent from '../../../ui/EmptyStageComponent';
import ErrorBox from '../../../ui/ErrorBox';
import InputWithSelect from '../../../ui/InputWithSelect';
import { Button } from '../../../ui/button';

const GoodsDetail = ({ formData: order, setFormData: setOrder, onCancel }) => {
  const {
    isCreatingSales,
    isCreatingPurchase,
    cta,
    isOrder,
    referenceOrderId,
  } = order;
  const translations = useTranslations('components.create_edit_order');

  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = getEnterpriseId();
  const orderDraft = isCreatingSales && SessionStorageService.get('orderDraft');
  const bidDraft = isCreatingPurchase && SessionStorageService.get('bidDraft');

  const pathName = usePathname();
  const isPurchasePage = pathName.includes('purchases');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});
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

      // ⬇Flatten and transform orderItems
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
    const isApplicable = checkVendorGSTApplicability(
      order?.selectedValue?.originalVendor,
    );
    setIsGstApplicableForPurchaseOrders(isApplicable);
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

        return {
          value,
          label,
          data,
          isAccepted,
          gstNumber,
          originalVendor: vendor,
        };
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

  const gstApplicable = isGstApplicable(
    isPurchasePage
      ? isGstApplicableForPurchaseOrders
      : isGstApplicableForSalesOrders,
  );

  const { grossAmount, totalGstAmount, finalAmount } = useOrderTotals(
    order?.orderItems || [],
    gstApplicable,
  );

  useEffect(() => {
    setOrder((prev) => {
      if (
        prev.totals?.grossAmount === grossAmount &&
        prev.totals?.totalGstAmount === totalGstAmount &&
        prev.totals?.finalAmount === finalAmount &&
        prev.totals?.gstApplicable === gstApplicable
      ) {
        return prev;
      }
      return {
        ...prev,
        totals: {
          grossAmount,
          totalGstAmount,
          finalAmount,
          gstApplicable,
        },
      };
    });
  }, [grossAmount, totalGstAmount, finalAmount, gstApplicable, setOrder]);

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
  const columns = useMemo(
    () => [
      {
        accessorKey: 'productName',
        header: 'Item',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col items-start gap-1">
              <span className="text-sm font-semibold text-neutral-800">
                {item.productName || item.serviceName}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: () => (
          <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Qty
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="text-center text-sm font-semibold text-neutral-600">
              {item.quantity}
            </div>
          );
        },
      },
      {
        accessorKey: 'unitPrice',
        header: () => (
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Price
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="pr-2 text-right text-sm font-semibold text-neutral-600">
              ₹
              {Number(item.unitPrice || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      {
        accessorKey: 'totalAmount',
        header: () => (
          <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Value
          </div>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const value = Number(item.totalAmount) || 0;
          return (
            <div className="text-neutral-750 pr-2 text-right text-sm font-bold">
              ₹
              {value.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          );
        },
      },
      ...(isGstApplicable(
        isPurchasePage
          ? isGstApplicableForPurchaseOrders
          : isGstApplicableForSalesOrders,
      )
        ? [
            {
              accessorKey: 'gstPerUnit',
              header: () => (
                <div className="text-center text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  GST %
                </div>
              ),
              cell: ({ row }) => {
                const item = row.original;
                return (
                  <div className="text-center text-sm font-medium text-neutral-500">
                    {item.gstPerUnit || 0}%
                  </div>
                );
              },
            },
            {
              accessorKey: 'totalGstAmount',
              header: () => (
                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Tax
                </div>
              ),
              cell: ({ row }) => {
                const item = row.original;
                const tax = Number(item.totalGstAmount) || 0;
                return (
                  <div className="pr-2 text-right text-sm font-semibold text-neutral-500">
                    ₹
                    {tax.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                );
              },
            },
            {
              accessorKey: 'finalAmount',
              header: () => (
                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Total
                </div>
              ),
              cell: ({ row }) => {
                const item = row.original;
                const total =
                  Number(
                    item.finalAmount || item.totalAmount + item.totalGstAmount,
                  ) || 0;
                return (
                  <div className="pr-2 text-right text-sm font-bold text-neutral-800">
                    ₹
                    {total.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                );
              },
            },
          ]
        : []),
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                title="Edit Item"
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-blue-600"
                onClick={() => {
                  setSelectedItem({
                    ...item,
                    productId: item.id || item.productId,
                  });

                  setOrder((prev) => {
                    const updatedItems = prev.orderItems.filter(
                      (oi) => oi.productId !== item.productId,
                    );
                    const updatedOrder = {
                      ...prev,
                      orderItems: updatedItems,
                    };

                    const key = cta === 'offer' ? 'orderDraft' : 'bidDraft';
                    const prevDraft = SessionStorageService.get(key) || {};
                    SessionStorageService.set(key, {
                      ...prevDraft,
                      ...updatedOrder,
                      itemDraft: item,
                    });

                    return updatedOrder;
                  });
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              <button
                type="button"
                title="Delete Item"
                className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500"
                onClick={() => {
                  setOrder((prev) => {
                    const updatedItems = prev.orderItems.filter(
                      (oi) => oi.productId !== item.productId,
                    );
                    const updatedOrder = {
                      ...prev,
                      orderItems: updatedItems,
                    };

                    const key = cta === 'offer' ? 'orderDraft' : 'bidDraft';
                    const prevDraft = SessionStorageService.get(key) || {};
                    SessionStorageService.set(key, {
                      ...prevDraft,
                      ...updatedOrder,
                    });

                    return updatedOrder;
                  });
                }}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [
      isPurchasePage,
      isGstApplicableForPurchaseOrders,
      isGstApplicableForSalesOrders,
      cta,
    ],
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
    <div className="flex min-h-[calc(100vh-200px)] flex-col gap-4">
      {/* 1. Section: Client/Vendor Information */}
      {isOfferType === 'GOODS' && (
        <div className="flex-shrink-0">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
            {cta === 'offer' ? 'Client Details' : 'Vendor Details'}
          </span>
          <section className="border-b bg-white p-5 shadow-none">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {cta === 'offer' ? (
                <div className="flex flex-col">
                  <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {translations('form.label.client')}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="clients"
                    placeholder={translations('form.input.client.placeholder')}
                    options={clientOptions}
                    styles={getStylesForSelectComponent()}
                    className="text-sm font-medium"
                    classNamePrefix="select"
                    value={
                      clientOptions?.find(
                        (option) => option.value === order?.buyerId,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      if (!selectedOption) return;

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
                  {errorMsg.buyerId && (
                    <div className="mt-1">
                      <ErrorBox msg={errorMsg.buyerId} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <label className="mb-1.5 flex gap-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {translations('form.label.vendor')}
                    <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="vendors"
                    placeholder={translations('form.input.vendor.placeholder')}
                    options={vendorOptions}
                    styles={getStylesForSelectComponent()}
                    className="text-sm font-medium"
                    classNamePrefix="select"
                    value={
                      vendorOptions?.find(
                        (option) =>
                          option.value === order?.selectedValue?.value,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      if (!selectedOption) return;

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

                      const { value: id, originalVendor } = selectedOption;

                      if (selectedOption.value === 'add-new-vendor') {
                        setIsModalOpen(true);
                      } else {
                        setIsGstApplicableForPurchaseOrders(
                          checkVendorGSTApplicability(originalVendor),
                        );

                        const updatedOrder = {
                          ...order,
                          sellerEnterpriseId: id,
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
                      }
                    }}
                  />
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
                    <div className="mt-1">
                      <ErrorBox msg={errorMsg.sellerEnterpriseId} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 2. Section: Items/Services Related Fields */}
      <div className="flex-shrink-0">
        <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
          Add Item
        </span>
        <section className="border-b bg-white p-4 shadow-none">
          <div className="flex flex-col gap-4">
            {/* Row 1: Item Select, Qty, Price */}
            <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-4">
              {/* Item Selection */}
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
                  className="w-full text-sm font-medium"
                  classNamePrefix="select"
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
                      productType: 'GOODS',
                      unitPrice:
                        selectedItemData.salesPrice ??
                        selectedItemData.rate ??
                        selectedItemData.cataloguePrice ??
                        0,
                      gstPerUnit,
                      productName: selectedItemData.name,
                      hsnCode: selectedItemData.hsnCode,
                    };

                    setSelectedItem(updatedItem);
                    saveDraftToSession({
                      cta,
                      data: { ...order, itemDraft: updatedItem },
                    });
                  }}
                />
                {errorMsg.orderItem && (
                  <div className="mt-1">
                    <ErrorBox msg={errorMsg.orderItem} />
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div className="flex flex-col gap-1.5">
                <InputWithSelect
                  id="quantity"
                  name={translations('form.label.quantity')}
                  required={true}
                  disabled={
                    (cta === 'offer' && order.buyerId == null) ||
                    order.sellerEnterpriseId == null
                  }
                  className="h-10 rounded-lg border-neutral-200 text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
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
                        data: { ...order, itemDraft: updated },
                      });
                      return updated;
                    });
                  }}
                  units={units?.quantity}
                  unitPlaceholder="Unit"
                  min={0}
                  step="any"
                />
                {errorMsg.quantity && (
                  <div className="mt-1">
                    <ErrorBox msg={errorMsg.quantity} />
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <label className="flex gap-1 text-xs font-medium text-neutral-500">
                  {translations('form.label.price')}
                  <span className="text-red-500">*</span>
                </label>
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
                  className="h-10 w-full rounded-lg border-neutral-200 bg-white text-sm font-medium text-neutral-700 shadow-sm focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20"
                  onChange={handlePriceChange}
                />
                {errorMsg.unitPrice && (
                  <div className="mt-1">
                    <ErrorBox msg={errorMsg.unitPrice} />
                  </div>
                )}
              </div>

              {/* Value */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-neutral-500">
                  {isOrder === 'invoice'
                    ? translations('form.label.invoice_value')
                    : translations('form.label.value')}
                </label>
                <Input
                  disabled
                  value={selectedItem.totalAmount || '0.00'}
                  className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                />
                {errorMsg.totalAmount && (
                  <div className="mt-1">
                    <ErrorBox msg={errorMsg.totalAmount} />
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Taxable Value, GST%, Tax Amount, Grand Total (Inc. GST), Buttons */}
            <div
              className={`grid grid-cols-1 items-end gap-4 ${
                isGstApplicable(
                  isPurchasePage
                    ? isGstApplicableForPurchaseOrders
                    : isGstApplicableForSalesOrders,
                )
                  ? 'md:grid-cols-4'
                  : 'md:grid-cols-3'
              }`}
            >
              {isGstApplicable(
                isPurchasePage
                  ? isGstApplicableForPurchaseOrders
                  : isGstApplicableForSalesOrders,
              ) && (
                <>
                  {/* GST % */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-500">
                      {translations('form.label.gst')} (%)
                    </label>
                    <Input
                      disabled
                      value={selectedItem.gstPerUnit || '0'}
                      className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                    />
                    {errorMsg.gstPerUnit && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.gstPerUnit} />
                      </div>
                    )}
                  </div>

                  {/* Tax Amount */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-neutral-500">
                      {translations('form.label.tax_amount')}
                    </label>
                    <Input
                      disabled
                      value={selectedItem.totalGstAmount || '0.00'}
                      className="h-10 w-full rounded-lg border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-500 shadow-sm"
                    />
                    {errorMsg.totalGstAmount && (
                      <div className="mt-1">
                        <ErrorBox msg={errorMsg.totalGstAmount} />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Amount (Grand Total) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-blue-600">
                  Total Amount (Inc. GST)
                </label>
                <div className="flex h-10 items-center rounded-lg border border-blue-100 bg-blue-50/30 px-3 text-sm font-bold text-blue-700 shadow-sm">
                  ₹
                  {(
                    Number(selectedItem.finalAmount) ||
                    (Number(selectedItem.totalAmount) || 0) +
                      (isGstApplicable(
                        isPurchasePage
                          ? isGstApplicableForPurchaseOrders
                          : isGstApplicableForSalesOrders,
                      )
                        ? Number(selectedItem.totalGstAmount) || 0
                        : 0)
                  ).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                {errorMsg.finalAmount && (
                  <div className="mt-1">
                    <ErrorBox msg={errorMsg.finalAmount} />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex h-10 items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  disabled={
                    !selectedItem.productId &&
                    !selectedItem.quantity &&
                    !selectedItem.unitPrice
                  }
                  onClick={() => {
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
                      data: { ...order, itemDraft: updatedItem },
                    });
                  }}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
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

                    const key = cta === 'offer' ? 'orderDraft' : 'bidDraft';
                    const { itemDraft, ...rest } =
                      SessionStorageService.get(key) || {};
                    saveDraftToSession({
                      cta,
                      data: { ...rest, ...updatedOrder },
                    });
                    setErrorMsg({});
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Section: DataTable */}
      <div className="flex-shrink-0">
        <span className="mb-2 block flex-shrink-0 text-[10px] font-bold uppercase tracking-widest text-primary">
          Line Items
        </span>
        <section className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-xl border-0 bg-white shadow-none">
          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="min-h-0 w-full flex-1 overflow-auto">
              <DataTable columns={columns} data={order.orderItems || []} />
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-gray-100 p-4 text-center text-neutral-400">
              <svg
                className="mb-2 h-10 w-10 text-neutral-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3m-11 0h3m-2 0a1 1 0 00-1 1v1a1 1 0 001 1h3a1 1 0 001-1v-1a1 1 0 00-1-1m-3 0h3"
                />
              </svg>
              <p className="text-sm font-medium text-neutral-500">
                No items added yet
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">
                Select and add items above to build your order.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default GoodsDetail;
