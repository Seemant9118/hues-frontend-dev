import { invoiceApi } from '@/api/invoice/invoiceApi';
import { getInvoices } from '@/services/Invoice_Services/Invoice_Services';
import { getDocument } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';
import emptyImg from '../../../public/Empty.png';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';

function PastInvoices({ setIsGenerateInvoice, orderDetails }) {
  const pathName = usePathname();
  const isPurchasesPage = pathName.includes('purchase-orders');
  const params = useParams();
  const orderId = params.order_id;

  // FETCH INVOICES API
  const { data: invoiceList, isLoading: isInvoicesLoading } = useQuery({
    queryKey: [invoiceApi.getInvoices.endpointKey, orderId],
    queryFn: () => getInvoices(orderId),
    select: (invoiceList) => invoiceList?.data?.data,
  });

  // CONCURRENT API CALL TO GET PUBLIC URLs
  const getPublicUrls = async (invoices) => {
    const urls = await Promise.all(
      invoices.map((invoice) =>
        getDocument(invoice?.attachmentLink).then((publicUrl) => ({
          ...invoice,
          publicUrl,
        })),
      ),
    );
    return urls;
  };

  const { data: invoiceListWithUrls, isLoading: isLoadingUrls } = useQuery({
    queryKey: ['invoicesWithUrls', invoiceList],
    queryFn: () => getPublicUrls(invoiceList),
    enabled: !!invoiceList, // Only run this query if invoiceList is available
  });

  // fn for formatted currency
  const formattedCurrency = React.useMemo(
    () => (amount) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'INR',
      }).format(amount);
    },
    [],
  );

  // fn for capitalization
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  if (isInvoicesLoading || isLoadingUrls) {
    return <Loading />;
  }

  return (
    <>
      <div className="scrollBarStyles flex max-h-[55vh] flex-col gap-4 overflow-auto">
        {invoiceListWithUrls && invoiceListWithUrls?.length > 0 ? (
          invoiceListWithUrls?.map((invoice) => {
            return (
              <div
                key={invoice?.id}
                className="flex flex-col gap-2 rounded-lg border bg-white p-4 shadow-customShadow"
              >
                <section className="flex items-center justify-between">
                  <div className="flex flex-col gap-4">
                    <h1 className="text-sm font-bold">
                      {invoice?.referenceNumber}
                    </h1>
                    <div className="flex gap-10">
                      <h1 className="text-sm">
                        <span className="font-bold text-[#ABB0C1]">
                          Date :{' '}
                        </span>
                        <span className="text-[#363940]">
                          {moment(invoice?.createdAt).format('DD-MM-YYYY')}
                        </span>
                      </h1>
                      <h1 className="text-sm">
                        <span className="font-bold text-[#ABB0C1]">
                          Total Amount :{' '}
                        </span>
                        <span className="font-bold text-[#363940]">
                          {formattedCurrency(invoice?.totalAmount)}
                        </span>
                        <span> (inc. GST)</span>
                      </h1>
                      <h1 className="text-sm font-bold">
                        <span className="font-bold text-[#ABB0C1]">
                          Type :{' '}
                        </span>
                        <span className="font-bold text-[#363940]">
                          {capitalize(invoice?.invoiceType)}
                        </span>
                      </h1>
                    </div>
                  </div>

                  <InvoicePDFViewModal
                    Url={invoice.publicUrl} // Use pre-fetched public URL
                  />
                </section>
              </div>
            );
          })
        ) : (
          <div className="flex h-[50rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
            <Image src={emptyImg} alt="emptyIcon" />
            <p className="font-bold">No invoices yet</p>
            <p className="max-w-96 text-center">
              {
                "You haven't created any invoices yet. Start by generating your first invoice to keep track of your orders"
              }
            </p>

            {!isPurchasesPage &&
              !orderDetails?.invoiceGenerationCompleted &&
              (orderDetails.negotiationStatus === 'ACCEPTED' ||
                (orderDetails.negotiationStatus === 'NEW' &&
                  orderDetails?.orderType === 'SALES')) && (
                <Button
                  className="bg-[#288AF9]"
                  onClick={() => setIsGenerateInvoice(true)}
                >
                  Generate Invoice
                </Button>
              )}
          </div>
        )}
      </div>
    </>
  );
}

export default PastInvoices;
