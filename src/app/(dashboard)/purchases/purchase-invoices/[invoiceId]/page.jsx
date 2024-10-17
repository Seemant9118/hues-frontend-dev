'use client';

import { invoiceApi } from '@/api/invoice/invoiceApi';
import InvoiceOverview from '@/components/invoices/InvoiceOverview';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { getInvoice } from '@/services/Invoice_Services/Invoice_Services';
import { useQuery } from '@tanstack/react-query';
import { Download, Share2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ViewInvoice = () => {
  const router = useRouter();
  const params = useParams();

  const invoiceOrdersBreadCrumbs = [
    {
      id: 1,
      name: 'Invoice',
      path: '/purchases/purchase-invoices/',
      show: true, // Always show
    },
    {
      id: 2,
      name: `Invoie details`,
      path: `/purchases/purchase-invoices/${params.invoiceId}`,
      show: true, // Always show
    },
  ];

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    const newPath = `/purchases/purchase-invoices/${params.invoiceId}`;
    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [params.invoiceId, router]);

  const { isLoading, data: invoiceDetails } = useQuery({
    queryKey: [invoiceApi.getInvoice.endpointKey, params.invoiceId],
    queryFn: () => getInvoice(params.invoiceId),
    select: (data) => data.data.data,
  });

  return (
    <Wrapper className="relative">
      {isLoading && !invoiceDetails?.invoiceDetails && <Loading />}

      {!isLoading && invoiceDetails?.invoiceDetails && (
        <>
          {/* headers */}
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white">
            <div className="flex gap-2 pt-2">
              {/* breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={invoiceOrdersBreadCrumbs}
              />
            </div>
            <div className="flex gap-2">
              {/* View CTA */}
              <Button
                variant="blue_outline"
                size="sm"
                className="flex items-center justify-center text-xs"
              >
                View
              </Button>

              {/* share CTA */}
              <Button
                variant="blue_outline"
                size="sm"
                className="flex items-center justify-center border border-[#DCDCDC] text-black"
              >
                <Share2 size={14} />
              </Button>

              {/* download CTA */}
              <Button
                variant="blue_outline"
                size="sm"
                className="flex items-center justify-center border border-[#DCDCDC] text-black"
              >
                <Download size={14} />
              </Button>
            </div>
          </section>
          {/* main body invoice details components */}
          <section>
            {/* orders overview */}
            <InvoiceOverview
              invoiceDetails={invoiceDetails.invoiceDetails}
              invoiceId={invoiceDetails?.invoiceDetails?.referenceNumber}
              Name={invoiceDetails?.invoiceDetails?.sellerEnterpriseId}
              type={invoiceDetails?.invoiceDetails?.invoiceType}
              date={invoiceDetails?.invoiceDetails?.createdAt}
              amount={invoiceDetails?.invoiceDetails?.totalAmount}
            />

            {/* orderDetail Table */}
            {/* <DataTable
              columns={OrderColumns}
              data={orderDetails?.orderItems}
            ></DataTable> */}
          </section>
        </>
      )}
    </Wrapper>
  );
};

export default ViewInvoice;
