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
import CommentBox from '@/components/comments/CommentBox';
import AddBooking from '@/components/dispatchNote/AddBooking';
import AddTransport from '@/components/dispatchNote/AddTransport';
import CreateEWB from '@/components/dispatchNote/CreateEWB';
import AddNewAddress from '@/components/enterprise/AddNewAddress';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';
import {
  getDispatchNote,
  sendToTransporter,
  update,
  updateDispatchNoteStatus,
} from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoveUpRight, Pencil, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast } from 'sonner';
import emptyImg from '../../../../../../../../public/Empty.png';
import { useDispatchedItemColumns } from './useDispatchedItemColumns';
import { useDispatchedTransporterBookingColumns } from './useDispatchedTransporterBookingColumns';

const ViewDispatchNote = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const translations = useTranslations(
    'sales.sales-dispatched-notes.dispatch_details',
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
  const [isCreatingEWB, setIsCreatingEWB] = useState(false);
  const [selectDispatcher, setSelectDispatcher] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editModeDispatchFrom, setEditModeDispatchFrom] = useState(false);
  const [selectBillingFrom, setSelectBillingFrom] = useState(null);
  const [editModeBillingFrom, setEditModeBillingFrom] = useState(false);

  const onTabChange = (tab) => {
    setTab(tab);
  };

  const dispatchOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.dispatch_notes'),
      path: '/dashboard/sales/sales-dispatched-notes',
      show: true,
    },
    {
      id: 2,
      name: translations('title.dispatch_details'),
      path: `/dashboard/sales/sales-dispatched-notes/${params.dispatchId}`,
      show: true,
    },
    {
      id: 3,
      name: translations('title.addBooking'),
      path: `/dashboard/sales/sales-dispatched-notes/${params.dispatchId}`,
      show: isAddingBooking,
    },
    {
      id: 4,
      name: translations('title.createEWB'),
      path: `/dashboard/sales/sales-dispatched-notes/${params.dispatchId}`,
      show: isCreatingEWB,
    },
  ];
  useEffect(() => {
    // Read the state from the query parameters
    const state = searchParams.get('state');

    setIsAddingBooking(state === 'addBooking');
    setIsCreatingEWB(state === 'createEWB');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/dashboard/sales/sales-dispatched-notes/${params.dispatchId}`;

    if (isAddingBooking) {
      newPath += '?state=addBooking';
    } else if (isCreatingEWB) {
      newPath += '?state=createEWB';
    } else {
      newPath += '';
    }

    router.push(newPath);
  }, [params.dispatchId, isAddingBooking, isCreatingEWB, router]);

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
      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDispatchNote.endpointKey],
      });
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
      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDispatchNote.endpointKey],
      });
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
        deliveryProcess.getDispatchNote.endpointKey,
        params.dispatchId,
      ],
      queryFn: () => getDispatchNote(params.dispatchId),
      select: (data) => data.data.data,
    });

  // formated dispatched items for table
  const mapDispatchDetailsForItems = (dispatchDetails = {}) => {
    if (!Array.isArray(dispatchDetails.items)) return [];

    return dispatchDetails?.items?.map((item) => ({
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
      type: booking?.bookingType ?? '--',
      bookingNo: booking?.bookingNumber ?? '--',
      date: booking?.bookingDate ?? null,
      remarks: booking?.remarks ?? '--',
    }));
  };
  const formattedDispatchedTransporterBookings =
    mapTransportBookings(dispatchDetails);

  // OVERVIEW DATA
  const totalAmount = Number(dispatchDetails?.totalAmount || 0);
  const totalGstAmount = Number(dispatchDetails?.totalGstAmount || 0);
  const overviewData = {
    invoiceId: dispatchDetails?.invoice?.referenceNumber || '-',
    consignor: dispatchDetails?.sellerDetails?.name || '-',
    consignee: dispatchDetails?.buyerName || '-',
    status: dispatchDetails?.status || '-',
    dispatchId: dispatchDetails?.referenceNumber || '-',
    totalAmount: formattedAmount(totalAmount + totalGstAmount),
    deliveryChallanNo: dispatchDetails?.deliveryVoucher?.referenceNumber || '-',
    EWB: dispatchDetails?.eWayBill?.ewbNumber || '-',
    transporter: dispatchDetails?.transporterName || '-',
    dispatchFrom: dispatchDetails?.dispatchFromAddress?.address || '-',
    billingFrom: dispatchDetails?.billingFromAddress?.address || '-',
    billingAddress: capitalize(dispatchDetails?.billingAddress?.address) || '-',
    shippingAddress:
      capitalize(dispatchDetails?.shippingAddress?.address) || '-',
  };
  const overviewLabels = {
    invoiceId: translations('overview_labels.invoiceId'),
    consignor: translations('overview_labels.consignor'),
    consignee: translations('overview_labels.consignee'),
    status: translations('overview_labels.status'),
    dispatchId: translations('overview_labels.dispatchId'),
    totalAmount: translations('overview_labels.totalAmount'),
    deliveryChallanNo: translations('overview_labels.delivery_challan_no'),
    EWB: translations('overview_labels.ewb'),
    transporter: translations('overview_labels.transporter'),
    dispatchFrom: translations('overview_labels.dispatch_from'),
    billingFrom: translations('overview_labels.billing_from'),
    billingAddress: translations('overview_labels.billing_address'),
    shippingAddress: translations('overview_labels.shipping_address'),
  };
  const hasNoTransporter = !dispatchDetails?.transporterName;
  const hasTransporter = Boolean(dispatchDetails?.transporterName);
  // overview custom label render
  const customLabelRender = {
    transporter: () => (
      <div className="flex items-center gap-2">
        <span>{translations('overview_labels.transporter')}</span>

        {/* Add CTA */}
        {hasNoTransporter && !isModalOpen && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs text-primary underline"
          >
            {translations('overview_inputs.ctas.add')}
          </button>
        )}

        {/* Edit CTA */}
        {hasTransporter && (
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
          !editModeDispatchFrom && (
            <button
              onClick={() => setEditModeDispatchFrom(true)}
              className="text-xs text-primary underline"
            >
              <Pencil size={12} />
            </button>
          )}
        {editModeDispatchFrom &&
          dispatchDetails?.dispatchFromAddress?.address && (
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
          !editModeBillingFrom && (
            <button
              onClick={() => setEditModeBillingFrom(true)}
              className="text-xs text-primary underline"
            >
              <Pencil size={12} />
            </button>
          )}
        {editModeBillingFrom &&
          dispatchDetails?.billingFromAddress?.address && (
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
    invoiceId: () => (
      <p
        className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
        onClick={() => {
          router.push(
            `/dashboard/sales/sales-invoices/${dispatchDetails?.invoice?.id}`,
          );
        }}
      >
        {dispatchDetails?.invoice?.referenceNumber} <MoveUpRight size={12} />
      </p>
    ),
    transporter: () => {
      const hasTransporter = Boolean(dispatchDetails?.transporterName);

      // 1. Transporter exists + not in edit mode → show label
      if (hasTransporter && !editMode && !isModalOpen) {
        return (
          <div className="flex flex-col gap-1">
            <span>{dispatchDetails.transporterName} </span>
            <span
              onClick={() =>
                sendToTransporterMutation.mutate({
                  dispatchNoteId: params.dispatchId,
                  data: {
                    transporterContact:
                      dispatchDetails?.transporterMobileNumber,
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
            dispatchNoteId={params.dispatchId}
            isModalOpen={editMode}
            setIsModalOpen={setEditMode}
            isAddingNewTransport={isAddingNewTransport}
            setIsAddingNewTransport={setIsAddingNewTransport}
            isEditMode={editMode}
            transportedEnterpriseId={dispatchDetails?.transporterEnterpriseId}
            createVendor={createVendor}
            getStylesForSelectComponent={getStylesForSelectComponent}
          />
        );
      }

      // 3. No transporter → show AddTransport
      return (
        <>
          <span>{'--'}</span>
          <AddTransport
            triggerLabel="Add Transporter"
            transportOptions={transportOptions}
            translations={translations}
            dispatchNoteId={params.dispatchId}
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
      const hasAddress = dispatchDetails?.dispatchFromAddress?.address;
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
                (opt) => opt.value === dispatchDetails.dispatchFromAddress.id,
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
                dispatchNoteId: params.dispatchId,
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
                dispatchNoteId: params.dispatchId,
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
        <span>{capitalize(dispatchDetails.dispatchFromAddress.address)}</span>
      );
    },

    billingFrom: () => {
      const hasBillingAddress = dispatchDetails?.billingFromAddress?.address;
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
                (opt) => opt.value === dispatchDetails.billingFromAddress.id,
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
                dispatchNoteId: params.dispatchId,
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
                dispatchNoteId: params.dispatchId,
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
        <span>{capitalize(dispatchDetails.billingFromAddress.address)}</span>
      );
    },
  };

  // updateStatus mutation
  const updateStatusMutation = useMutation({
    mutationFn: updateDispatchNoteStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDispatchNote.endpointKey],
      });
      toast.success(translations('overview_inputs.toast.dispatchNoteReady'));
    },
    onError: (error) => {
      toast.error(
        error.response.data.message ||
          translations('overview_inputs.toast.commonError'),
      );
    },
  });

  const readyForDispatch = () => {
    updateStatusMutation.mutate({
      dispatchNoteId: params.dispatchId,
      data: { status: 'READY_FOR_DISPATCH' },
    });
  };

  // columns
  const dispatchedItemDetailsColumns = useDispatchedItemColumns();
  const dispatchedTransportedBookingsColumns =
    useDispatchedTransporterBookingColumns();

  if (isDispatchDetailsLoading) {
    <Loading />;
  }
  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="h-full py-2">
        {!isAddingBooking && !isCreatingEWB && (
          <>
            {/* HEADER */}
            <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={dispatchOrdersBreadCrumbs}
              />

              {/* ctas */}
              <div className="flex items-center gap-2">
                {/* ready for dispatch cta */}
                {dispatchDetails?.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    variant="blue_outline"
                    onClick={readyForDispatch}
                  >
                    {translations('overview_inputs.ctas.readyForDispatch')}
                  </Button>
                )}
                {/* add a booking */}
                {(dispatchDetails?.status === 'READY_FOR_DISPATCH' ||
                  dispatchDetails?.status === 'READY_FOR_TRANSPORT') && (
                  <Button
                    size="sm"
                    onClick={() => setIsAddingBooking(true)}
                    variant="blue_outline"
                  >
                    {translations('overview_inputs.ctas.addBooking')}
                  </Button>
                )}
                {/* generate e-way bill cta */}
                <Button size="sm" onClick={() => setIsCreatingEWB(true)}>
                  {translations('overview_inputs.ctas.generateEWayBill')}
                </Button>
              </div>
            </section>

            <Tabs
              value={tab}
              onValueChange={onTabChange}
              defaultValue={'overview'}
            >
              <section className="flex items-center justify-between gap-1">
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
                </TabsList>
                {/* ctas update part b */}
                {tab === 'transports' &&
                  formattedDispatchedTransporterBookings?.length > 0 && (
                    <Button size="sm" disabled={true} variant="blue_outline">
                      {translations('overview_inputs.ctas.updatePartB')}
                    </Button>
                  )}
              </section>
              <TabsContent value="overview">
                {/* add new address : visible if isAddingNewAddress is true */}
                <AddNewAddress
                  isAddressAdding={isAddingNewAddress}
                  setIsAddressAdding={setIsAddingNewAddress}
                  mutationKey={settingsAPI.addUpdateAddress.endpointKey}
                  mutationFn={addUpdateAddress}
                  invalidateKey={deliveryProcess.getDispatchNote.endpointKey}
                />
                {/* OVERVIEW SECTION */}
                <Overview
                  collapsible={false}
                  data={overviewData}
                  labelMap={overviewLabels}
                  customRender={customRender}
                  customLabelRender={customLabelRender}
                />

                {/* COMMENTS */}
                <CommentBox
                  contextId={params.dispatchId}
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
            </Tabs>
          </>
        )}

        {isAddingBooking && !isCreatingEWB && (
          <AddBooking
            translations={translations}
            overviewData={overviewData}
            overviewLabels={overviewLabels}
            customRender={customRender}
            customLabelRender={customLabelRender}
            setTab={setTab}
            queryClient={queryClient}
            dispatchNoteId={params.dispatchId}
            isAddingBooking={isAddingBooking}
            setIsAddingBooking={setIsAddingBooking}
            dispatchOrdersBreadCrumbs={dispatchOrdersBreadCrumbs}
          />
        )}

        {isCreatingEWB && !isAddingBooking && (
          <CreateEWB
            overviewData={overviewData}
            overviewLabels={overviewLabels}
            customRender={customRender}
            customLabelRender={customLabelRender}
            dispatchOrdersBreadCrumbs={dispatchOrdersBreadCrumbs}
            setIsCreatingEWB={setIsCreatingEWB}
            dispatchDetails={dispatchDetails}
          />
        )}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDispatchNote;
