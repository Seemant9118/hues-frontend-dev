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
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { MoveUpRight } from 'lucide-react';
import { useDispatchedItemColumns } from './useDispatchedItemColumns';
import { useDispatchedTransporterBookingColumns } from './useDispatchedTransporterBookingColumns';
import emptyImg from '../../../../../../../../public/Empty.png';

const ViewDispatchNote = () => {
  const translations = useTranslations(
    'sales.sales-dispatched-notes.dispatch_details',
  );

  const router = useRouter();
  const params = useParams();
  const [tab, setTab] = useState('items');

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

  const totalAmount = Number(dispatchDetails?.totalAmount || 0);
  const totalGstAmount = Number(dispatchDetails?.totalGstAmount || 0);

  const overviewData = {
    invoiceId: dispatchDetails?.invoice?.referenceNumber,
    buyerId: dispatchDetails?.buyerName,
    totalAmount: formattedAmount(totalAmount + totalGstAmount),
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
          customRender={{
            invoiceId: () => (
              <p
                className="flex cursor-pointer items-center gap-0.5 text-base font-semibold hover:text-primary hover:underline"
                onClick={() => {
                  router.push(
                    `/dashboard/sales/sales-invoices/${dispatchDetails?.invoice?.id}`,
                  );
                }}
              >
                {dispatchDetails?.invoice?.referenceNumber}{' '}
                <MoveUpRight size={12} />
              </p>
            ),
          }}
        />

        <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
          <TabsList className="border">
            <TabsTrigger value="items">
              {translations('tabs.tab1.title')}
            </TabsTrigger>
            <TabsTrigger value="transports">
              {translations('tabs.tab2.title1')}
            </TabsTrigger>
          </TabsList>
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
                    {translations('tabs.tab2.emtpyStateComponent.title')}
                  </p>
                  <ProtectedWrapper
                    permissionCode={'permission:sales-create-payment'}
                  >
                    <p className="max-w-96 text-center">
                      {translations('tabs.tab2.emtpyStateComponent.para')}
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

        {/* COMMENTS */}
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewDispatchNote;
