'use client';

import { clientEnterprise } from '@/api/enterprises_user/client_enterprise/client_enterprise';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { paymentApi } from '@/api/payments/payment_api';
import { templateApi } from '@/api/templates_api/template_api';
import InvoicePDFViewModal from '@/components/Modals/InvoicePDFViewModal';
import InvoiceOverview from '@/components/invoices/InvoiceOverview';
import ConditionalRenderingStatus from '@/components/orders/ConditionalRenderingStatus';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import { usePaymentColumns } from '@/components/payments/paymentColumns';
import { DataTable } from '@/components/table/data-table';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import { getClients } from '@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service';
import { getInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { getPaymentsByInvoiceId } from '@/services/Payment_Services/PaymentServices';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import emptyImg from '../../../../../../public/Empty.png';
import { useSalesInvoiceColumns } from './useSalesInvoiceColumns';

const ViewInvoice = () => {
  const router = useRouter();
  const params = useParams();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [tab, setTab] = useState('overview');

  const invoiceOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'Invoice',
      path: '/sales/sales-invoices',
      show: true, // Always show
    },
    {
      id: 2,
      name: `Invoice details`,
      path: `/sales/sales-invoices${params.invoiceId}`,
      show: true, // Always show
    },
  ];

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    const newPath = `/sales/sales-invoices/${params.invoiceId}`;
    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [params.invoiceId, router]);

  // Function to handle tab change
  const onTabChange = (value) => {
    setTab(value);
  };

  // fetch invoice details
  const { isLoading, data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, params.invoiceId],
    queryFn: () => getInvoice(params.invoiceId),
    select: (data) => data.data.data,
    enabled: tab === 'overview',
  });

  // conversion pvt url to public url to download
  const pvtUrl = invoiceDetails?.invoiceDetails?.attachmentLink;
  // Fetch the PDF document using react-query
  const { data: pdfDoc } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });

  // invoice items details
  const invoiceItems = invoiceDetails?.invoiceItemDetails?.map((invoice) => ({
    productName:
      invoice?.orderItemId?.productDetails?.productName ||
      invoice?.orderItemId?.productDetails?.serviceName,
    quantity: invoice?.quantity,
    unitPrice: invoice?.unitPrice,
    totalAmount: invoice?.totalAmount,
  }));

  // fetch payment details
  const { isLoading: isPaymentsLoading, data: paymentsListing } = useQuery({
    queryKey: [paymentApi.getPaymentsByInvoiceId.endpointKey, params.invoiceId],
    queryFn: () => getPaymentsByInvoiceId(params.invoiceId),
    select: (data) => data.data.data,
    enabled: tab === 'payment',
  });

  // to get client name
  const { data: clients } = useQuery({
    queryKey: [clientEnterprise.getClients.endpointKey],
    queryFn: () => getClients(enterpriseId),
    select: (res) => res.data.data,
  });
  const client = clients?.find((clientData) => {
    const clientId = clientData?.client?.id ?? clientData?.id;
    return clientId === invoiceDetails?.invoiceDetails?.buyerEnterpriseId;
  });

  const clientName =
    client?.client === null
      ? client?.invitation?.userDetails?.name
      : client?.client?.name;
  const paymentStatus = ConditionalRenderingStatus({
    status: invoiceDetails?.invoiceDetails?.metaData?.payment?.status,
  });
  const debitNoteStatus = ConditionalRenderingStatus({
    status: invoiceDetails?.invoiceDetails?.metaData?.creditNote?.status,
  });

  const paymentsColumns = usePaymentColumns();
  const invoiceItemsColumns = useSalesInvoiceColumns();

  return (
    <Wrapper className="relative">
      {/* headers */}
      <section className="sticky top-0 z-10 flex items-center justify-between bg-white">
        <div className="flex gap-2 pt-2">
          {/* breadcrumbs */}
          <OrderBreadCrumbs
            possiblePagesBreadcrumbs={invoiceOrdersBreadCrumbs}
          />
        </div>
        <div className="flex gap-2">
          {/* View CTA modal */}
          <InvoicePDFViewModal Url={pdfDoc?.publicUrl} />

          {/* share CTA */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center justify-center"
          >
            <Share2 size={14} />
          </Button>

          {/* download CTA */}
          <Button size="sm" asChild variant="outline" className="w-full">
            <a download={pdfDoc?.publicUrl} href={pdfDoc?.publicUrl}>
              <Download size={14} />
            </a>
          </Button>
        </div>
      </section>
      <Tabs value={tab} onValueChange={onTabChange} defaultValue={'overview'}>
        <TabsList className="border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="debitNotes">Debit Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          {isLoading && <Loading />}
          {/* orders overview */}
          {!isLoading && invoiceDetails?.invoiceDetails && (
            <div className="flex flex-col gap-4">
              <InvoiceOverview
                isCollapsableOverview={false}
                invoiceDetails={invoiceDetails.invoiceDetails}
                invoiceId={invoiceDetails?.invoiceDetails?.referenceNumber}
                orderId={
                  invoiceDetails?.invoiceItemDetails[0]?.orderItemId?.orderId
                }
                paymentStatus={paymentStatus}
                debitNoteStatus={debitNoteStatus}
                Name={clientName}
                type={invoiceDetails?.invoiceDetails?.invoiceType}
                date={invoiceDetails?.invoiceDetails?.createdAt}
                amount={invoiceDetails?.invoiceDetails?.totalAmount}
              />

              <DataTable data={invoiceItems} columns={invoiceItemsColumns} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="payment">
          {isPaymentsLoading && <Loading />}
          {/* orders overview */}
          {!isPaymentsLoading && paymentsListing?.length > 0 && (
            <DataTable data={paymentsListing} columns={paymentsColumns} />
          )}
          {!isPaymentsLoading && paymentsListing?.length === 0 && (
            <div className="flex h-[29rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
              <Image src={emptyImg} alt="emptyIcon" />
              <p className="font-bold">No payments yet</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="debitNotes"></TabsContent>
      </Tabs>
    </Wrapper>
  );
};

export default ViewInvoice;
