import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import { Ban } from 'lucide-react';
import { invoiceApi } from '@/api/invoice/invoiceApi';
import { getInvoices } from '@/services/Invoice_Services/Invoice_Services';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import Loading from '../ui/Loading';

function PastInvoices() {
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const params = useParams();
  const orderId = params.order_id;

  // api calling
  const { isLoading, data: invoicedDataList } = useQuery({
    queryKey: [invoiceApi.getInvoices.endpointKey, orderId],
    queryFn: () => getInvoices(orderId),
    select: (data) => data.data.data,
  });

  // Sort the invoicedDataList by createdAt in descending order : latest invoice shows first
  const sortedInvoicedDataList = invoicedDataList?.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="scrollBarStyles flex max-h-[100vh] flex-col gap-2 overflow-auto">
      {sortedInvoicedDataList && sortedInvoicedDataList.length > 0 ? (
        sortedInvoicedDataList.map((invoice) => {
          // Check if the invoiceId from searchParams matches the current invoice.id
          const shouldOpenModal = String(invoice.id) === String(invoiceId);

          return (
            <div
              key={invoice?.id}
              className="flex flex-col gap-2 rounded-lg border border-black bg-gray-50 p-4"
            >
              <section className="flex justify-between gap-2">
                <div className="flex flex-col gap-2">
                  <h1 className="text-sm font-bold">
                    Invoice No. : {invoice?.referenceNumber}
                  </h1>
                  <h1 className="text-sm font-bold">
                    Date : {moment(invoice?.createdAt).format('DD-MM-YYYY')}
                  </h1>
                  <h1 className="text-sm font-bold">
                    Type: {capitalize(invoice?.invoiceType)}
                  </h1>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <h1 className="text-sm font-bold">
                    Total Amount <span className="text-xs">(inc. GST)</span> :{' '}
                    {formattedCurrency(invoice?.totalAmount)}
                  </h1>
                  <InvoicePDFViewModal
                    invoiceId={invoice.id}
                    pvtUrl={invoice?.attachmentLink}
                    shouldOpen={shouldOpenModal} // Automatically open this modal if invoiceId matches
                  />
                </div>
              </section>
              <div className="border border-gray-200"></div>
              <div className="flex flex-col gap-2">
                <ul className="scrollBarStyles flex max-h-24 flex-col gap-2 overflow-auto text-sm">
                  <li className="grid grid-cols-4 font-bold">
                    <span>ITEM</span>
                    <span>QUANTITY</span>
                    <span>DATE</span>
                    <span>AMOUNT</span>
                  </li>
                  {invoice?.invoiceItems?.map((item) => {
                    // Extract product name from productDetails
                    const productName =
                      item?.orderItemId?.productDetails?.productName ||
                      item?.orderItemId?.productDetails?.serviceName ||
                      'N/A';

                    return (
                      <li key={item?.id} className="grid grid-cols-4">
                        <span>{productName}</span>
                        <span>{item?.quantity}</span>
                        <span>
                          {moment(item?.createdAt).format('DD-MM-YYYY')}
                        </span>
                        <span>{formattedCurrency(item?.grossAmount)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex h-[50rem] flex-col items-center justify-center gap-2 rounded-lg border border-black bg-gray-50 p-4">
          <Ban size={24} />
          <div>There are no invoices for this order.</div>
        </div>
      )}
    </div>
  );
}

export default PastInvoices;
