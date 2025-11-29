'use client';

import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Overview from '@/components/ui/Overview';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedWrapper } from '@/components/wrappers/ProtectedWrapper';
import Wrapper from '@/components/wrappers/Wrapper';
import { getEWB } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { Tabs } from '@radix-ui/react-tabs';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

const TESTING_DATA = [
  {
    ewbNo: 131001298692,
    ewayBillDate: '26/09/2018',
    genMode: 'API',
    userGstin: '29AKLPM8755F1Z2',
    supplyType: 'O',
    subSupplyType: '1 ',
    docType: 'INV',
    docNo: '7007-8',
    docDate: '10/09/2018',
    fromGstin: '29AKLPM8755F1Z2',
    fromTrdName: 'welton',
    fromAddr1: '4556',
    fromAddr2: 'hulimavu',
    fromPlace: 'bannargatta',
    fromPincode: 560090,
    fromStateCode: 29,
    toGstin: '02EHFPS5910D2Z0',
    toTrdName: 'test2',
    toAddr1: 'Shree Nilaya',
    toAddr2: 'Dasarahosahalli',
    toPlace: 'Beml Nagar',
    toPincode: 560090,
    toStateCode: 29,
    totalValue: 56099.0,
    totInvValue: 68358.0,
    cgstValue: 1.0,
    sgstValue: 1.0,
    igstValue: 0.0,
    cessValue: 400.56,
    transporterId: '',
    transporterName: '',
    status: 'ACT',
    actualDist: 2500,
    noValidDays: 25,
    validUpto: '27/09/2018 11:59:00 PM',
    extendedTimes: 0,
    rejectStatus: 'N',
    actFromStateCode: 29,
    actToStateCode: 29,
    vehicleType: 'R',
    transactionType: 4,
    otherValue: -10.0,
    cessNonAdvolValue: 400.0,
    itemList: [
      {
        itemNo: 1,
        productId: 0,
        productName: 'CEMENT',
        productDesc: ' ',
        hsnCode: 25210010,
        quantity: 2.0,
        qtyUnit: 'BOX',
        cgstRate: 0.05,
        sgstRate: 0.05,
        igstRate: 0.0,
        cessRate: 3.0,
        cessNonAdvol: 0,
        taxableAmount: 56.0,
      },
      {
        itemNo: 2,
        productId: 0,
        productName: 'steel',
        productDesc: 'steel rods',
        hsnCode: 2402,
        quantity: 4.0,
        qtyUnit: 'NOS',
        cgstRate: 10.0,
        sgstRate: 10.0,
        igstRate: 0.0,
        cessRate: 3.0,
        cessNonAdvol: 0.0,
        taxableAmount: 0.0,
      },
    ],
    VehiclListDetails: [
      {
        updMode: 'API',
        vehicleNo: 'PQR1234',
        fromPlace: 'Bengaluru',
        fromState: 29,
        tripshtNo: 1810002031,
        userGSTINTransin: '29AKLPM8755F1Z2',
        enteredDate: '26/09/2018 02:40:00 PM',
        transMode: '1 ',
        transDocNo: '1234',
        transDocDate: '03/05/2018',
        groupNo: '1',
      },
      {
        updMode: 'API',
        vehicleNo: 'PQR1234',
        fromPlace: 'Bengaluru',
        fromState: 29,
        tripshtNo: 1110002030,
        userGSTINTransin: '29AKLPM8755F1Z2',
        enteredDate: '26/09/2018 02:40:00 PM',
        transMode: '1 ',
        transDocNo: '1234',
        transDocDate: '03/05/2018',
        vehicleType: '',
        groupNo: '0',
      },
      {
        updMode: 'API',
        vehicleNo: 'KA25AB3456',
        fromPlace: 'BANGALORE SOUTH',
        fromState: 29,
        tripshtNo: 1510002029,
        userGSTINTransin: '29AKLPM8755F1Z2',
        enteredDate: '26/09/2018 02:40:00 PM',
        transMode: '1 ',
        transDocNo: '1234',
        transDocDate: '12/10/2017',
        vehicleType: '',
        groupNo: '0',
      },
      {
        updMode: 'API',
        vehicleNo: 'KA25AB3456',
        fromPlace: 'BANGALORE SOUTH',
        fromState: 29,
        tripshtNo: 1810002028,
        userGSTINTransin: '29AKLPM8755F1Z2',
        enteredDate: '26/09/2018 02:40:00 PM',
        transMode: '1 ',
        transDocNo: '1234',
        transDocDate: '12/10/2017',
        vehicleType: '',
        groupNo: '0',
      },
      {
        updMode: 'API',
        vehicleNo: 'RJ191G5024',
        fromPlace: 'bannargatta',
        fromState: 29,
        tripshtNo: 0,
        userGSTINTransin: '29AKLPM8755F1Z2',
        enteredDate: '26/09/2018 02:40:00 PM',
        transMode: '1 ',
        transDocNo: '12345',
        transDocDate: null,
        vehicleType: 'R',
        groupNo: '0',
      },
    ],
  },
];
const data = TESTING_DATA[0];

const ViewEWB = () => {
  const translations = useTranslations(
    'sales.sales-dispatched-notes.dispatch_details',
  );

  const params = useParams();
  const [tab, setTab] = useState('overview');

  const onTabChange = () => {
    setTab(tab);
  };

  const ewbBreadCrumbs = [
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
      name: translations('title.ewaybillDetails'),
      path: `/dashboard/sales/sales-dispatched-notes/${params.dispatchId}/${params.ewb_id}`,
      show: true,
    },
  ];

  const { data: ewaybillDetail } = useQuery({
    queryKey: [deliveryProcess.getEWB.endpointKey, data.ewbNo],
    queryFn: () => getEWB(data.ewbNo),
    select: (res) => res.data.data,
  });

  const overviewData = {
    invoiceId: ewaybillDetail.docNo || '-', // → "7007-8"
    consignor: ewaybillDetail.fromTrdName || '-', // → "welton"
    consignee: ewaybillDetail.toTrdName || '-', // → "test2"
    status: ewaybillDetail.status || '-', // → "ACT"
    dispatchId: ewaybillDetail.ewbNo || '-', // → EWB Number (131001298692)
    totalAmount: ewaybillDetail.totInvValue || '-', // → 68358.0
    deliveryChallanNo: ewaybillDetail.tripshtNo || '-', // Not available directly → choose tripsheet
    EWB: ewaybillDetail.ewbNo || '-', // → e-Way bill number again
    transporter: ewaybillDetail.transporterName || '-', // → empty in sample
    dispatchFrom: ewaybillDetail.fromPlace || '-', // → "bannargatta"
    billingFrom: ewaybillDetail.fromAddr1 || '-', // → "4556"
    billingAddress: ewaybillDetail.fromAddr2 || '-', // → "hulimavu"
    shippingAddress: ewaybillDetail.toAddr1 || '-', // → "Shree Nilaya"
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

  return (
    <ProtectedWrapper permissionCode={'permission:sales-view'}>
      <Wrapper className="h-full py-2">
        <>
          {/* HEADER */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <OrderBreadCrumbs possiblePagesBreadcrumbs={ewbBreadCrumbs} />
          </section>

          {/* Body */}
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
              </TabsList>
            </section>

            <TabsContent value="overview">
              <Overview data={overviewData} labelMap={overviewLabels} />
            </TabsContent>
          </Tabs>
        </>
      </Wrapper>
    </ProtectedWrapper>
  );
};

export default ViewEWB;
