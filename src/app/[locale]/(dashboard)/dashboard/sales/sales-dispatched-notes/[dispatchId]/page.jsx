'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { formattedAmount } from '@/appUtils/helperFunctions';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import Overview from '@/components/ui/Overview';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { getDispatchNote } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React from 'react';
import { useDispatchedItemColumns } from './useDispatchedItemColumns';
import { useDispatchedTransporterBookingColumns } from './useDispatchedTransporterBookingColumns';

const ViewDispatchNote = () => {
  const translations = useTranslations('sales.sales-dispatch.dispatch_details');

  const params = useParams();

  const dispatchOrdersBreadCrumbs = [
    {
      id: 1,
      name: translations('title.dispatch_notes'),
      path: '/dashboard/sales/dispatch-notes',
      show: true,
    },
    {
      id: 2,
      name: translations('title.dispatch_details'),
      path: `/dashboard/sales/dispatch-notes/${params.dispatchId}`,
      show: true,
    },
  ];

  // fetch dispatch details
  const { isLoading: isDispatchDetailsLoading, data: dispatchDetails } =
    useQuery({
      queryKey: [
        deliveryProcess.getDisptachNote.endpointKey,
        params.dispatchId,
      ],
      queryFn: () => getDispatchNote(params.dispatchId),
      select: (data) => data.data.data,
    });

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

  const mapTransportBookings = (dispatchDetails = {}) => {
    if (!Array.isArray(dispatchDetails.transportBookings)) return [];

    return dispatchDetails.transportBookings.map((booking) => ({
      type: booking?.bookingType ?? '--',
      bookingNo: booking?.bookingNumber ?? '--',
      date: booking?.bookingDate ?? null,
      remarks: booking?.remarks ?? '--',
    }));
  };
  const formattedDispatchedTransporterBookings = mapTransportBookings();

  const overviewData = {
    invoiceId: dispatchDetails?.invoice?.referenceNumber,
    buyerId: dispatchDetails?.buyerId,
    totalAmount: formattedAmount(dispatchDetails?.totalAmount),
    status: dispatchDetails?.status,
    dispatchId: dispatchDetails?.referenceNumber,
  };

  const overviewLabels = {
    invoiceId: translations('overview_labels.invoiceId'),
    buyerId: translations('overview_labels.buyerId'),
    totalAmount: translations('overview_labels.totalAmount'),
    status: translations('overview_labels.status'),
    dispatchId: translations('overview_labels.dispatchId'),
  };

  const dispatchedItemDetailsColumns = useDispatchedItemColumns();
  const dispatchedTransportedBookingsColumns =
    useDispatchedTransporterBookingColumns();

  if (isDispatchDetailsLoading) {
    <Loading />;
  }
  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="h-full py-2">
        {/* HEADER */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <OrderBreadCrumbs
            possiblePagesBreadcrumbs={dispatchOrdersBreadCrumbs}
          />
        </section>

        {/* OVERVIEW SECTION */}
        <Overview
          collapsible={true}
          data={overviewData}
          labelMap={overviewLabels}
        />

        {/* ITEMS TABLE */}
        <section className="mt-6 rounded-md border bg-white p-4">
          <h2 className="mb-3 text-lg font-bold">
            {translations('sections.items')}
          </h2>
          <DataTable
            data={formattedDispatchedItems || []}
            columns={dispatchedItemDetailsColumns}
          />
        </section>

        {/* TRANSPORT BOOKINGS */}
        <section className="mt-6 rounded-md border bg-white p-4">
          <h2 className="mb-3 text-lg font-bold">
            {translations('sections.transport_bookings')}
          </h2>
          {formattedDispatchedTransporterBookings?.length === 0 && (
            <h2 className="text-center">
              {translations('sections.no_booking')}
            </h2>
          )}
          {formattedDispatchedTransporterBookings?.length > 0 && (
            <DataTable
              data={formattedDispatchedTransporterBookings || []}
              columns={dispatchedTransportedBookingsColumns}
            />
          )}
        </section>

        {/* COMMENTS */}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDispatchNote;
