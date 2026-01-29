'use client';

import { addressAPIs } from '@/api/addressApi/addressApis';
import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import { settingsAPI } from '@/api/settings/settingsApi';
import {
  capitalize,
  formattedAmount,
  getStylesForSelectComponent,
} from '@/appUtils/helperFunctions';
import Tooltips from '@/components/auth/Tooltips';
import CommentBox from '@/components/comments/CommentBox';
import AddBooking from '@/components/dispatchNote/AddBooking';
import AddTransport from '@/components/dispatchNote/AddTransport';
import CreateEWBA from '@/components/dispatchNote/CreateEWBA';
import CreateEWBB from '@/components/dispatchNote/CreateEWBB';
import AddNewAddress from '@/components/enterprise/AddNewAddress';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { DynamicTextInfo } from '@/components/ui/dynamic-text-info';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';
import {
  getDeliveryChallan,
  getEWBs,
  getPODByChallan,
  previewPOD,
  sendPOD,
  sendToTransporter,
  update,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Eye,
  MoveUpRight,
  Pencil,
  Plus,
  PlusCircle,
  RefreshCcw,
  Send,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import useMetaData from '@/hooks/useMetaData';
import emptyImg from '../../../../../../../../public/Empty.png';
import { SalesTable } from '../../../sales/salestable/SalesTable';
import { useDispatchedItemColumns } from './useDispatchedItemColumns';
import { useDispatchedTransporterBookingColumns } from './useDispatchedTransporterBookingColumns';
import { useEWBsColumns } from './useEWBsColumns';
import { usePODColumns } from './usePODColumns';

const ViewDelivery = () => {
  useMetaData(
    'Hues! - Delivery Challan Details',
    'HUES Delivery Challan Details',
  );
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const translations = useTranslations(
    'transport.delivery-challan.delivery_challan_details',
  );

  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddingNewTransport, setIsAddingNewTransport] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isAddingBooking, setIsAddingBooking] = useState(false);
  const [isCreatingEWBA, setIsCreatingEWBA] = useState(false);
  const [isCreatingEWBB, setIsCreatingEWBB] = useState(false);
  const [selectDispatcher, setSelectDispatcher] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editModeDispatchFrom, setEditModeDispatchFrom] = useState(false);
  const [selectBillingFrom, setSelectBillingFrom] = useState(null);
  const [editModeBillingFrom, setEditModeBillingFrom] = useState(false);
  const [selectedTransportForUpdateB, setSelectedTransportForUpdateB] =
    useState(null);
  const [ewayBills, setEwayBills] = useState(null);
  const [paginationData, setPaginationData] = useState(null);

  const onTabChange = (tab) => {
    setTab(tab);
  };

  const dispatchOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.dispatch_notes'),
      path: '/dashboard/transport/delivery-challan/',
      show: true,
    },
    {
      id: 2,
      name: translations('title.dispatch_details'),
      path: `/dashboard/transport/delivery-challan/${params.deliveryId}`,
      show: true,
    },
    {
      id: 3,
      name: translations('title.addBooking'),
      path: `/dashboard/transport/delivery-challan/${params.deliveryId}`,
      show: isAddingBooking,
    },
    {
      id: 4,
      name: translations('title.createEWBA'),
      path: `/dashboard/transport/delivery-challan/${params.deliveryId}`,
      show: isCreatingEWBA,
    },
    {
      id: 5,
      name: translations('title.createEWBB'),
      path: `/dashboard/transport/delivery-challan/${params.deliveryId}`,
      show: isCreatingEWBB,
    },
  ];
  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');

    setIsAddingBooking(state === 'addBooking');
    setIsCreatingEWBA(state === 'createEWBA');
    setIsCreatingEWBB(state === 'createEWBB');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/dashboard/transport/delivery-challan/${params.deliveryId}`;

    if (isAddingBooking) {
      newPath += '?state=addBooking';
    } else if (isCreatingEWBA) {
      newPath += '?state=createEWBA';
    } else if (isCreatingEWBB) {
      newPath += '?state=createEWBB';
    } else {
      newPath += '';
    }

    router.push(newPath);
  }, [
    params.deliveryId,
    isAddingBooking,
    isCreatingEWBA,
    isCreatingEWBB,
    router,
  ]);

  // vendors[transporter] fetching
  const { data: transports } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
    enabled: isModalOpen || editMode, // Fetch only when modal is open or in edit mode
  });

  // vendors options
  const transportOptions = [
    ...(transports || []).map((vendor) => {
      const value = vendor?.id;
      const label =
        vendor?.vendor?.name || vendor.invitation?.userDetails?.name;

      return { value, label };
    }),
    // Special option for "Add New Vendor"
    {
      value: 'add-new-vendor', // Special value for "Add New Vendor"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('overview_inputs.addNewTransporter')}
        </span>
      ),
    },
  ];

  // send To Transporter
  const sendToTransporterMutation = useMutation({
    mutationFn: sendToTransporter,
    onSuccess: () => {
      toast.success(
        translations('overview_inputs.toast.sendToTransporterSuccess'),
      );
      queryClient.invalidateQueries([
        deliveryProcess.getDispatchNote.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('overview_inputs.toast.commonError'),
      );
    },
  });

  // get addresses
  const { data: addresses } = useQuery({
    queryKey: [addressAPIs.getAddressByEnterprise.endpointKey, enterpriseId],
    queryFn: () => getAddressByEnterprise(enterpriseId),
    select: (res) => res.data.data,
  });

  const addressesOptions = [
    ...(addresses || []).map((address) => {
      const value = address?.id;
      const label = address?.address;

      return { value, label };
    }),
    // Special option for "address New Address"
    {
      value: 'add-new-address', // Special value for "Add New Address"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {translations('overview_inputs.addNewAddress')}
        </span>
      ),
    },
  ];

  // update - address (dispatch from,biling from)
  const updateDispatchInfo = useMutation({
    mutationFn: update,
    onSuccess: () => {
      queryClient.invalidateQueries([
        deliveryProcess.getDispatchNote.endpointKey,
      ]);
      toast.success(translations('overview_inputs.toast.dispatchInfoUpdated'));
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('overview_inputs.toast.commonError'),
      );
    },
  });
  // fetch dispatch details
  const { isLoading: isDispatchDetailsLoading, data: dispatchDetails } =
    useQuery({
      queryKey: [
        deliveryProcess.getDeliveryChallan.endpointKey,
        params.deliveryId,
      ],
      queryFn: () => getDeliveryChallan(params.deliveryId),
      select: (data) => data.data.data,
    });
  const isSeller =
    dispatchDetails?.metaData?.sellerEnterpriseId === enterpriseId;

  // formated dispatched items for table
  const mapDispatchDetailsForItems = (dispatchDetails = {}) => {
    if (!Array.isArray(dispatchDetails?.metaData?.items)) return [];

    return dispatchDetails?.metaData?.items?.map((item) => ({
      productName:
        item?.invoiceItem?.orderItemId?.productDetails?.productName ?? '--',

      invoiceQuantity: item?.invoiceItem?.quantity ?? 0,

      dispatchedQuantity: item?.dispatchedQuantity ?? 0,

      rate: item?.invoiceItem?.unitPrice ?? 0,

      amount: Number(item?.amount ?? 0),
    }));
  };
  const formattedDispatchedItems = mapDispatchDetailsForItems(dispatchDetails);

  // formatted dispatched transporter bookings for table
  const mapTransportBookings = (dispatchDetails = {}) => {
    if (!Array.isArray(dispatchDetails.transportBookings)) return [];

    return dispatchDetails?.transportBookings?.map((booking) => ({
      bookingId: booking?.id,
      type: booking?.bookingType ?? '--',
      bookingNo: booking?.bookingNumber ?? '--',
      date: booking?.bookingDate ?? null,
      remarks: booking?.remarks ?? '--',
      attachments: booking.documents,
      ewayBillNo: booking.ewayBillNo,
      hasPartBDetails: booking?.hasPartBDetails,
    }));
  };
  const formattedDispatchedTransporterBookings =
    mapTransportBookings(dispatchDetails);

  // OVERVIEW DATA
  const totalAmount = Number(dispatchDetails?.metaData?.totalAmount || 0);
  const totalGstAmount = Number(dispatchDetails?.metaData?.totalGstAmount || 0);
  const overviewData = {
    deliveryChallanNo: dispatchDetails?.referenceNumber || '-',

    consignor: dispatchDetails?.metaData?.sellerDetails?.name || '-',
    consignee: dispatchDetails?.metaData?.buyerName || '-',
    supply: dispatchDetails?.metaData?.supply || 'Outward Supply',
    ...(isSeller && {
      dispatchId: dispatchDetails?.dispatchNote?.referenceNumber || '-',
    }),
    invoiceId: dispatchDetails?.metaData?.invoice?.referenceNumber || '-',
    totalAmount: formattedAmount(totalAmount + totalGstAmount),
    EWB: dispatchDetails?.metaData?.ewb || '-',
    dispatchFrom:
      dispatchDetails?.metaData?.dispatchFromAddress?.address || '-',
    billingFrom: dispatchDetails?.metaData?.billingFromAddress?.address || '-',
    billingAddress:
      capitalize(dispatchDetails?.metaData?.billingAddress?.address) || '-',
    shippingAddress:
      capitalize(dispatchDetails?.metaData?.shippingAddress?.address) || '-',
  };
  const overviewLabels = {
    deliveryChallanNo: translations('overview_labels.delivery_challan_no'),
    consignor: translations('overview_labels.consignor'),
    consignee: translations('overview_labels.consignee'),
    supply: translations('overview_labels.supply'),
    ...(isSeller && {
      dispatchId: translations('overview_labels.dispatchId'),
    }),
    invoiceId: translations('overview_labels.invoiceId'),
    totalAmount: translations('overview_labels.totalAmount'),
    EWB: translations('overview_labels.ewb'),
    dispatchFrom: translations('overview_labels.dispatch_from'),
    billingFrom: translations('overview_labels.billing_from'),
    billingAddress: translations('overview_labels.billing_address'),
    shippingAddress: translations('overview_labels.shipping_address'),
  };

  // overview custom label render
  const hasNoTransporter = !dispatchDetails?.metaData?.transporterName;
  const hasTransporter = Boolean(dispatchDetails?.metaData?.transporterName);
  const customLabelRender = {
    transporter: () => (
      <div className="flex items-center gap-2">
        <span>{translations('overview_labels.transporter')}</span>

        {/* Add CTA */}
        {dispatchDetails?.metaData?.transporterType !== 'SELF' &&
          hasNoTransporter &&
          !isModalOpen && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-xs text-primary underline"
            >
              {translations('overview_inputs.ctas.add')}
            </button>
          )}

        {/* Edit CTA */}
        {dispatchDetails?.metaData?.transporterType !== 'SELF' &&
          hasTransporter &&
          dispatchDetails?.status === 'DRAFT' && (
            <>
              {!editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs text-primary underline"
                >
                  <Pencil size={12} />
                </button>
              )}

              {editMode && (
                <button
                  onClick={() => setEditMode(false)}
                  className="text-xs text-primary underline"
                >
                  <X size={12} />
                </button>
              )}
            </>
          )}
      </div>
    ),
    dispatchFrom: () => (
      <div className="flex items-center gap-2">
        <span>{translations('overview_labels.dispatch_from')}</span>
        {dispatchDetails?.dispatchFromAddress?.address &&
          !editModeDispatchFrom &&
          dispatchDetails?.status === 'DRAFT' && (
            <button
              onClick={() => setEditModeDispatchFrom(true)}
              className="text-xs text-primary underline"
            >
              <Pencil size={12} />
            </button>
          )}
        {editModeDispatchFrom &&
          dispatchDetails?.dispatchFromAddress?.address &&
          dispatchDetails?.status === 'DRAFT' && (
            <button
              onClick={() => setEditModeDispatchFrom(false)}
              className="text-xs text-primary underline"
            >
              <X size={12} />
            </button>
          )}
      </div>
    ),
    billingFrom: () => (
      <div className="flex items-center gap-2">
        <span>{translations('overview_labels.billing_from')}</span>
        {dispatchDetails?.billingFromAddress?.address &&
          !editModeBillingFrom &&
          dispatchDetails?.status === 'DRAFT' && (
            <button
              onClick={() => setEditModeBillingFrom(true)}
              className="text-xs text-primary underline"
            >
              <Pencil size={12} />
            </button>
          )}
        {editModeBillingFrom &&
          dispatchDetails?.billingFromAddress?.address &&
          dispatchDetails?.status === 'DRAFT' && (
            <button
              onClick={() => setEditModeBillingFrom(false)}
              className="text-xs text-primary underline"
            >
              <X size={12} />
            </button>
          )}
      </div>
    ),
  };
  // overview custom render
  const customRender = {
    dispatchId: () => {
      if (!isSeller) return null;

      return (
        <p
          className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
          onClick={() => {
            router.push(
              `/dashboard/transport/dispatch/${dispatchDetails?.dispatchNote?.id}`,
            );
          }}
        >
          {dispatchDetails?.dispatchNote?.referenceNumber}
          <MoveUpRight size={12} />
        </p>
      );
    },
    invoiceId: () => {
      const invoice = dispatchDetails?.metaData?.invoice;

      if (!invoice?.id || !invoice?.referenceNumber) return '-';

      const path = isSeller
        ? `/dashboard/sales/sales-invoices/${invoice.id}`
        : `/dashboard/purchases/purchase-invoices/${invoice.id}`;

      return (
        <p
          className="flex cursor-pointer items-center gap-1 hover:text-primary hover:underline"
          onClick={() => router.push(path)}
        >
          {invoice.referenceNumber}
          <MoveUpRight size={14} />
        </p>
      );
    },
    transporter: () => {
      const hasTransporter = Boolean(
        dispatchDetails?.metaData?.transporterName,
      );

      // 1. Transporter exists + not in edit mode → show label
      if (hasTransporter && !editMode && !isModalOpen) {
        return (
          <div className="flex flex-col gap-1">
            <span>{dispatchDetails?.metaData?.transporterName} </span>
            <span
              onClick={() =>
                sendToTransporterMutation.mutate({
                  dispatchNoteId: dispatchDetails?.dispatchNote?.id,
                  data: {
                    transporterContact:
                      dispatchDetails?.metaData?.transporterMobileNumber,
                  },
                })
              }
              className="cursor-pointer text-xs font-semibold text-primary hover:underline"
            >
              {translations('overview_inputs.ctas.share')}
            </span>
          </div>
        );
      }

      // 2. Transporter exists + edit mode → show edit modal
      if (hasTransporter && editMode) {
        return (
          <AddTransport
            triggerLabel="Edit Transporter"
            transportOptions={transportOptions}
            translations={translations}
            dispatchNoteId={params.deliveryId}
            isModalOpen={editMode}
            setIsModalOpen={setEditMode}
            isAddingNewTransport={isAddingNewTransport}
            setIsAddingNewTransport={setIsAddingNewTransport}
            isEditMode={editMode}
            transportedEnterpriseId={
              dispatchDetails?.metaData?.transporterEnterpriseId
            }
            createVendor={createVendor}
            getStylesForSelectComponent={getStylesForSelectComponent}
          />
        );
      }

      // 3. No transporter → show AddTransport
      return (
        <>
          <span>
            {dispatchDetails?.metaData?.transporterType === 'SELF'
              ? dispatchDetails?.metaData?.sellerDetails?.name
              : '--'}
          </span>
          <AddTransport
            triggerLabel="Add Transporter"
            transportOptions={transportOptions}
            translations={translations}
            dispatchNoteId={params.deliveryId}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            isAddingNewTransport={isAddingNewTransport}
            setIsAddingNewTransport={setIsAddingNewTransport}
            isEditMode={editMode}
            createVendor={createVendor}
            getStylesForSelectComponent={getStylesForSelectComponent}
          />
        </>
      );
    },
    dispatchFrom: () => {
      const hasAddress =
        dispatchDetails?.metaData?.dispatchFromAddress?.address;
      const selectedValue = selectDispatcher?.selectedValue;

      // CASE 1: Edit Mode → Show Select with Prefilled Value
      if (editModeDispatchFrom && hasAddress) {
        return (
          <Select
            name="dispatchFrom"
            placeholder={translations('overview_inputs.dispatch_from')}
            options={addressesOptions}
            styles={getStylesForSelectComponent()}
            className="max-w-full text-sm"
            classNamePrefix="select"
            value={
              selectedValue ||
              addressesOptions.find(
                (opt) =>
                  opt.value ===
                  dispatchDetails.metaData?.dispatchFromAddress.id,
              )
            }
            onChange={(selectedOption) => {
              if (!selectedOption) return;

              if (selectedOption.value === 'add-new-address') {
                setIsAddingNewAddress(true);
                return;
              }

              setSelectDispatcher({
                dispatchFrom: selectedOption.value,
                selectedValue: selectedOption,
              });

              updateDispatchInfo.mutate({
                dispatchNoteId: params.deliveryId,
                data: {
                  dispatchFromAddressId: selectedOption.value,
                },
              });

              setEditModeDispatchFrom(false);
            }}
          />
        );
      }

      // CASE 2: No Address → Show Blank Select
      if (!hasAddress) {
        return (
          <Select
            name="dispatchFrom"
            placeholder={translations('overview_inputs.dispatch_from')}
            options={addressesOptions}
            styles={getStylesForSelectComponent()}
            className="max-w-full text-sm"
            classNamePrefix="select"
            value={selectedValue || null}
            onChange={(selectedOption) => {
              if (!selectedOption) return;

              if (selectedOption.value === 'add-new-address') {
                setIsAddingNewAddress(true);
                return;
              }

              setSelectDispatcher({
                dispatchFrom: selectedOption.value,
                selectedValue: selectedOption,
              });

              updateDispatchInfo.mutate({
                dispatchNoteId: params.deliveryId,
                data: {
                  dispatchFromAddressId: selectedOption.value,
                },
              });
            }}
          />
        );
      }

      // CASE 3: Has Address & Not Editing → Show Text
      return (
        <span>
          {capitalize(dispatchDetails?.metaData?.dispatchFromAddress?.address)}
        </span>
      );
    },

    billingFrom: () => {
      const hasBillingAddress =
        dispatchDetails?.metaData?.billingFromAddress?.address;
      const selectedValue = selectBillingFrom?.selectedValue;

      // CASE 1: Edit Mode → Show Select with Prefilled Value
      if (editModeBillingFrom && hasBillingAddress) {
        return (
          <Select
            name="billingFrom"
            placeholder={translations('overview_inputs.billing_from')}
            options={addressesOptions}
            styles={getStylesForSelectComponent()}
            className="max-w-full text-sm"
            classNamePrefix="select"
            value={
              selectedValue ||
              addressesOptions.find(
                (opt) =>
                  opt.value === dispatchDetails.metaData?.billingFromAddress.id,
              )
            }
            onChange={(selectedOption) => {
              if (!selectedOption) return;

              if (selectedOption.value === 'add-new-address') {
                setIsAddingNewAddress(true);
                return;
              }

              setSelectBillingFrom({
                billingFrom: selectedOption.value,
                selectedValue: selectedOption,
              });

              updateDispatchInfo.mutate({
                dispatchNoteId: params.deliveryId,
                data: {
                  billingFromAddressId: selectedOption.value,
                },
              });

              setEditModeBillingFrom(false);
            }}
          />
        );
      }

      // CASE 2: No Address → Show Select
      if (!hasBillingAddress) {
        return (
          <Select
            name="billingFrom"
            placeholder={translations('overview_inputs.billing_from')}
            options={addressesOptions}
            styles={getStylesForSelectComponent()}
            className="max-w-full text-sm"
            classNamePrefix="select"
            value={selectedValue || null}
            onChange={(selectedOption) => {
              if (!selectedOption) return;

              if (selectedOption.value === 'add-new-address') {
                setIsAddingNewAddress(true);
                return;
              }

              setSelectBillingFrom({
                billingFrom: selectedOption.value,
                selectedValue: selectedOption,
              });

              updateDispatchInfo.mutate({
                dispatchNoteId: params.deliveryId,
                data: {
                  billingFromAddressId: selectedOption.value,
                },
              });
            }}
          />
        );
      }

      // CASE 3: Has Address & Not Editing → Text
      return (
        <span>
          {capitalize(dispatchDetails?.metaData?.billingFromAddress?.address)}
        </span>
      );
    },
  };

  // get EWBs list
  // Fetch dispatched notes data with infinite scroll
  const {
    data,
    refetch,
    fetchNextPage,
    isFetching,
    isLoading: isEWBsLoading,
  } = useInfiniteQuery({
    queryKey: [deliveryProcess.getEWBs.endpointKey, params.deliveryId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getEWBs({
        id: params.deliveryId,
        page: pageParam,
        limit: 10,
      });
      return response;
    },
    initialPageParam: 1,
    getNextPageParam: (_lastGroup, groups) => {
      const nextPage = groups.length + 1;
      return nextPage <= _lastGroup.data.data.totalPages ? nextPage : undefined;
    },
    enabled: tab === 'ewb',
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!data) return;

    // Extract EWBs from all pages
    const flattenedEWBsData = data.pages
      .map((page) => page?.data?.ewayBills ?? [])
      .flat();

    // Deduplicate using `id`
    const uniqueEWBsData = Array.from(
      new Map(flattenedEWBsData.map((ewb) => [ewb.id, ewb])).values(),
    );

    // Update state
    setEwayBills(uniqueEWBsData);

    // Pagination: use last page's pagination block
    const lastPage = data.pages[data.pages.length - 1]?.data?.pagination;

    setPaginationData({
      totalPages: Number(lastPage?.totalPages ?? 0),
      currFetchedPage: Number(lastPage?.page ?? 1),
    });
  }, [data]);

  const sendPODMutation = useMutation({
    mutationFn: sendPOD,
    onSuccess: (data) => {
      toast.success('POD send to consignee');
      router.push(`/dashboard/transport/pod/${data?.data?.data?.id}`);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const buildPODPayload = (dispatchDetails) => {
    const meta = dispatchDetails.metaData;
    const seller = meta.sellerDetails;
    const { invoice } = meta;

    return {
      voucherId: dispatchDetails.id,
      dispatchNoteId: dispatchDetails.dispatchNoteId,
      buyerId: dispatchDetails.buyerId,
      buyerType: dispatchDetails.buyerType,
      metadata: {
        buyerId: meta.buyerId,
        buyerType: meta.buyerType,
        sellerEnterpriseId: meta.sellerEnterpriseId,

        sellerDetails: {
          name: seller?.name || '',
          gst: seller?.gst || '',
          billFromAddress: meta.billingFromAddress?.address || '',
          dispatchFromAddress: meta.dispatchFromAddress?.address || '',
        },

        buyerDetails: {
          name: meta.buyerName || '',
          gst: meta.buyerGst || '',
          billingAddress: meta.billingAddress?.address || '',
          shippingAddress: meta.shippingAddress?.address || '',
        },

        invoiceDetails: {
          id: invoice?.id || '',
          referenceNumber: invoice?.referenceNumber || '',
          invoiceDate: invoice?.createdAt || '',
          eWayBillId: meta.ewb || '',
        },
      },

      items: meta.items.map((item) => ({
        dispatchNoteItemId: item.id,

        acceptQuantity: item.dispatchedQuantity ?? 0,
        rejectQuantity: 0,

        rejectionReason: '',

        amount: Number(item.amount),
        gstAmount: Number(item.gstAmount),

        metadata: {
          productDetails: item.invoiceItem?.orderItemId?.productDetails || {},
        },
      })),
    };
  };

  const handleSendPOD = () => {
    const payload = buildPODPayload(dispatchDetails);

    sendPODMutation.mutate({ data: payload });
  };

  // fetch pod details
  const {
    data: podDetails,
    isLoading: isPODsLoading,
    isFetching: isPODsFetching,
  } = useQuery({
    queryKey: [
      deliveryProcess.getPODByChallan.endpointKey,
      dispatchDetails?.id,
    ],
    queryFn: () => getPODByChallan({ id: dispatchDetails?.id }),
    select: (data) => data?.data?.data,
    enabled: tab === 'pod',
  });

  const isPODsRejected =
    podDetails?.length > 0 &&
    podDetails.every((pod) => pod.status === 'REJECTED');

  const previewPODMutation = useMutation({
    mutationFn: previewPOD,
    onSuccess: async (data) => {
      toast.success('Document Generated Successfully');
      const pdfSlug = data?.data?.data?.podDocumentSlug;

      viewPdfInNewTab(pdfSlug);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handlePreviewPOD = () => {
    if (podDetails?.documentLink) {
      viewPdfInNewTab(podDetails?.documentLink);
    } else {
      previewPODMutation.mutate({
        id: podDetails?.id,
      });
    }
  };

  const podTotalAmount = Number(podDetails?.totalAmount || 0);
  const podTotalGstAmount = Number(podDetails?.totalGstAmount || 0);
  const podOverviewData = {
    podId: podDetails?.referenceNumber || '-',
    consignor: podDetails?.metaData?.sellerDetails?.name || '-',
    consignee: podDetails?.metaData?.buyerDetails?.name || '-',
    status: podDetails?.status,
    totalAmount: formattedAmount(podTotalAmount + podTotalGstAmount),
  };
  const podOverviewLabel = {
    podId: translations('overview_labels.podId'),
    consignor: translations('overview_labels.consignor'),
    consignee: translations('overview_labels.consignee'),
    status: translations('overview_labels.status'),
    totalAmount: translations('overview_labels.totalAmount'),
  };

  const podCustomDataRender = {
    podId: () => (
      <div className="flex items-center gap-2">
        <span>{podDetails?.referenceNumber}</span>
        {/* preview pod cta */}
        <Tooltips
          trigger={
            <button
              onClick={handlePreviewPOD}
              className="rounded-sm border p-2 font-bold hover:bg-accent"
            >
              <Eye size={14} />
            </button>
          }
          content={'Preview PoD Document'}
        />
      </div>
    ),
  };

  const handlePreview = () => {
    viewPdfInNewTab(dispatchDetails?.document?.documentSlug);
  };

  const onEWBRowClick = (row) => {
    return router.push(
      `/dashboard/transport/dispatch${params.deliveryId}/${row.ewbNo}`,
    );
  };

  const onPoDRowClick = (row) => {
    return router.push(`/dashboard/transport/pod/${row.id}`);
  };

  // logic to render data into overview component
  const isPOD =
    tab === 'pod' && podDetails && Object.keys(podDetails).length > 0;
  const overviewDataToRender = !isPOD ? overviewData : podOverviewData;
  const overviewLabelsToRender = !isPOD ? overviewLabels : podOverviewLabel;
  const overviewCustomDataToRender = !isPOD
    ? customRender
    : podCustomDataRender;
  const overviewCustomLabelsToRender = !isPOD && customLabelRender;

  // logics to rendered required component/ctas
  const isNeededToCreateBookingOrEWB =
    !dispatchDetails?.metaData?.ewb &&
    dispatchDetails?.transportBookings?.length === 0;
  const isEWBRequired =
    dispatchDetails?.transportBookings?.length > 0 &&
    dispatchDetails?.isEWBRequired &&
    !dispatchDetails?.metaData?.ewb;
  const showAddBookingCTA =
    tab !== 'ewb' &&
    tab !== 'pod' &&
    tab !== 'items' &&
    isSeller &&
    formattedDispatchedTransporterBookings?.length === 0;

  const isRestrictedTabForRequestPODs = ['ewb', 'transports', 'items'].includes(
    tab,
  );
  const canRequestPod =
    !dispatchDetails?.isPodCreated && !!dispatchDetails?.enablePodCreation;
  const canReRequestPod = !!dispatchDetails?.isPodCreated && !!isPODsRejected; // add enablePodCreation if needed
  const showRequestPODCTA =
    !isRestrictedTabForRequestPODs &&
    isSeller &&
    (canRequestPod || canReRequestPod);

  const showGenerateEWBCTA =
    tab !== 'transports' && tab !== 'pod' && tab !== 'items' && isSeller;

  // columns
  const dispatchedItemDetailsColumns = useDispatchedItemColumns();
  const dispatchedTransportedBookingsColumns =
    useDispatchedTransporterBookingColumns({
      setIsCreatingEWBB,
      setSelectedTransportForUpdateB,
    });
  const ewaybillsColumns = useEWBsColumns();
  const podsColumns = usePODColumns({ isSeller });

  if (isDispatchDetailsLoading) {
    <Loading />;
  }
  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="h-full py-2">
        {!isAddingBooking && !isCreatingEWBA && !isCreatingEWBB && (
          <>
            {/* HEADER */}
            <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={dispatchOrdersBreadCrumbs}
              />
              {/* preview */}
              <Tooltips
                trigger={
                  <Button
                    onClick={handlePreview}
                    size="sm"
                    variant="outline"
                    className="font-bold"
                  >
                    <Eye size={14} />
                  </Button>
                }
                content={'Preview Delivery challan'}
              />
            </section>

            <Tabs
              value={tab}
              onValueChange={onTabChange}
              defaultValue={'overview'}
            >
              <section className="mb-2 flex items-center justify-between gap-1">
                <TabsList className="border">
                  <TabsTrigger value="overview">
                    {translations('tabs.tab1.title')}
                  </TabsTrigger>
                  <TabsTrigger value="items">
                    {translations('tabs.tab2.title')}
                  </TabsTrigger>
                  <TabsTrigger value="transports">
                    {translations('tabs.tab3.title1')}
                  </TabsTrigger>
                  <TabsTrigger value="ewb">
                    {translations('tabs.tab4.title')}
                  </TabsTrigger>
                  <TabsTrigger value="pod">
                    {translations('tabs.tab5.title')}
                  </TabsTrigger>
                </TabsList>
                {/* ctas - tab based */}
                <div className="flex items-center gap-2">
                  {/* request POD */}
                  {showRequestPODCTA && (
                    <Button
                      variant="blue_outline"
                      size="sm"
                      onClick={handleSendPOD}
                    >
                      <Send size={14} />
                      {translations('overview_inputs.ctas.requestPOD')}
                    </Button>
                  )}

                  {/* add a booking cta */}
                  {showAddBookingCTA && (
                    <Button
                      variant="blue_outline"
                      size="sm"
                      onClick={() => setIsAddingBooking(true)}
                    >
                      <PlusCircle size={14} />
                      {translations('overview_inputs.ctas.addBooking')}
                    </Button>
                  )}
                  {/* refresh EWB cta */}
                  {tab === 'ewb' &&
                    dispatchDetails?.metaData?.sellerEnterpriseId ===
                      enterpriseId && (
                      <Button
                        size="sm"
                        variant="blue_outline"
                        onClick={async () => {
                          const res = await refetch();
                          if (!res.error) toast.success('E-way bills fetched');
                        }}
                      >
                        <RefreshCcw size={14} />
                        {translations('overview_inputs.ctas.refreshEWayBill')}
                      </Button>
                    )}
                  {/* generate e-way bill cta */}
                  {showGenerateEWBCTA && dispatchDetails?.isFirstVoucher ? (
                    <Button size="sm" onClick={() => setIsCreatingEWBA(true)}>
                      <PlusCircle size={14} />
                      {translations('overview_inputs.ctas.generateEWayBill')}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setIsCreatingEWBB(true)}>
                      <PlusCircle size={14} />
                      {translations('overview_inputs.ctas.updatePartB')}
                    </Button>
                  )}
                </div>
              </section>

              <TabsContent value="overview">
                {/* OVERVIEW SECTION */}
                <Overview
                  collapsible={tab !== 'overview'}
                  data={overviewDataToRender}
                  labelMap={overviewLabelsToRender}
                  customRender={overviewCustomDataToRender}
                  customLabelRender={overviewCustomLabelsToRender}
                />
                {/* add new address : visible if isAddingNewAddress is true */}
                <AddNewAddress
                  isAddressAdding={isAddingNewAddress}
                  setIsAddressAdding={setIsAddingNewAddress}
                  mutationKey={settingsAPI.addUpdateAddress.endpointKey}
                  mutationFn={addUpdateAddress}
                  invalidateKey={deliveryProcess.getDispatchNote.endpointKey}
                />

                {isNeededToCreateBookingOrEWB && (
                  <DynamicTextInfo
                    variant="warning"
                    title="No Transport Booking or E-Way Bill Found"
                    description="Please add transport bookings or generate an E-Way Bill to proceed."
                  />
                )}

                {isEWBRequired && (
                  <DynamicTextInfo
                    variant={totalAmount > 50000 ? 'danger' : 'warning'}
                    title={
                      totalAmount > 50000
                        ? 'E-Way Bill Required'
                        : 'E-Way Bill Optional'
                    }
                    description={
                      `This challan ${totalAmount > 50000 ? 'requires' : 'may not require'} an E-Way Bill. ` +
                      `(${
                        totalAmount > 50000
                          ? 'Since the total amount exceeds ₹50,000, generating an E-Way Bill is mandatory.'
                          : 'Since the total amount is ₹50,000 or below, generating an E-Way Bill is optional.'
                      })`
                    }
                  />
                )}

                {/* COMMENTS */}
                <CommentBox
                  contextId={params.deliveryId}
                  context={'DISPATCH_NOTE'}
                />
              </TabsContent>
              <TabsContent value="items">
                {/* ITEMS TABLE */}
                <section className="mt-2">
                  <DataTable
                    data={formattedDispatchedItems || []}
                    columns={dispatchedItemDetailsColumns}
                  />
                </section>
              </TabsContent>
              <TabsContent value="transports">
                {/* TRANSPORT BOOKINGS */}
                <section className="mt-2">
                  {formattedDispatchedTransporterBookings?.length === 0 && (
                    <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p className="font-bold">
                        {translations('tabs.tab3.emtpyStateComponent.title')}
                      </p>
                      <ProtectedWrapper
                        permissionCode={'permission:sales-create-payment'}
                      >
                        <p className="max-w-96 text-center">
                          {translations('tabs.tab3.emtpyStateComponent.para')}
                        </p>
                      </ProtectedWrapper>
                    </div>
                  )}
                  {formattedDispatchedTransporterBookings?.length > 0 && (
                    <DataTable
                      data={formattedDispatchedTransporterBookings || []}
                      columns={dispatchedTransportedBookingsColumns}
                    />
                  )}
                </section>
              </TabsContent>
              <TabsContent value="ewb">
                {(isEWBsLoading || isFetching) && <Loading />}
                {(!isEWBsLoading || !isFetching) && ewayBills?.length > 0 ? (
                  <SalesTable
                    id="ewbs"
                    columns={ewaybillsColumns}
                    data={ewayBills}
                    fetchNextPage={fetchNextPage}
                    isFetching={isFetching}
                    totalPages={paginationData?.totalPages}
                    currFetchedPage={paginationData?.currFetchedPage}
                    onRowClick={onEWBRowClick}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
                    <Image src={emptyImg} alt="emptyIcon" />
                    <p className="font-bold">
                      {translations('tabs.tab4.emtpyStateComponent.title')}
                    </p>
                    <ProtectedWrapper
                      permissionCode={'permission:sales-create-payment'}
                    >
                      <p className="max-w-96 text-center">
                        {translations('tabs.tab4.emtpyStateComponent.para')}
                      </p>
                    </ProtectedWrapper>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="pod">
                {/* Loading */}
                {(isPODsLoading || isPODsFetching) && <Loading />}

                {/* Content */}
                {!isPODsLoading &&
                  !isPODsFetching &&
                  (podDetails?.length > 0 ? (
                    <div className="flex h-full flex-col gap-2">
                      {/* Scrollable table area */}
                      <div className="flex-1 overflow-auto">
                        <DataTable
                          id="pods"
                          columns={podsColumns}
                          data={podDetails}
                          onRowClick={onPoDRowClick}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
                      <Image src={emptyImg} alt="emptyIcon" />
                      <p className="font-bold">
                        {translations('tabs.tab5.emtpyStateComponent.title')}
                      </p>
                      <ProtectedWrapper permissionCode="permission:sales-create-payment">
                        <p className="max-w-96 text-center">
                          {translations('tabs.tab5.emtpyStateComponent.para')}
                        </p>
                      </ProtectedWrapper>
                    </div>
                  ))}
              </TabsContent>
            </Tabs>
          </>
        )}

        {isAddingBooking && !isCreatingEWBA && !isCreatingEWBB && (
          <AddBooking
            translations={translations}
            overviewData={overviewData}
            overviewLabels={overviewLabels}
            customRender={customRender}
            customLabelRender={customLabelRender}
            setTab={setTab}
            queryClient={queryClient}
            dispatchNoteId={dispatchDetails?.dispatchNote?.id}
            deliveryId={params.deliveryId}
            isAddingBooking={isAddingBooking}
            setIsAddingBooking={setIsAddingBooking}
            dispatchOrdersBreadCrumbs={dispatchOrdersBreadCrumbs}
          />
        )}

        {isCreatingEWBA && !isCreatingEWBB && !isAddingBooking && (
          <CreateEWBA
            dispatchNoteId={params.deliveryId}
            overviewData={overviewData}
            overviewLabels={overviewLabels}
            customRender={customRender}
            customLabelRender={customLabelRender}
            dispatchOrdersBreadCrumbs={dispatchOrdersBreadCrumbs}
            setIsCreatingEWB={setIsCreatingEWBA}
            dispatchDetails={dispatchDetails?.metaData}
          />
        )}
        {isCreatingEWBB && !isCreatingEWBA && !isAddingBooking && (
          <CreateEWBB
            dispatchNoteId={params.deliveryId}
            overviewData={overviewData}
            overviewLabels={overviewLabels}
            customRender={customRender}
            customLabelRender={customLabelRender}
            dispatchOrdersBreadCrumbs={dispatchOrdersBreadCrumbs}
            setIsCreatingEWB={setIsCreatingEWBB}
            dispatchDetails={dispatchDetails?.metaData}
            selectedTransportForUpdateB={selectedTransportForUpdateB}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDelivery;
