import { invoiceApi } from '@/api/invoice/invoiceApi';
import { getInvoices } from '@/services/Invoice_Services/Invoice_Services';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import Image from 'next/image';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import Loading from '../ui/Loading';
import emptyImg from '../../../public/Empty.png';
import { Button } from '../ui/button';
import { DataTable } from '../table/data-table';
import { invoiceColumns } from './invoicesColumns';

function PastInvoices({ setIsGenerateInvoice, orderDetails, filterData }) {
  const pathName = usePathname();
  const isPurchasesPage = pathName.includes('purchase-orders');
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get('invoiceId');
  const params = useParams();
  const orderId = params.order_id;

  // api calling
  const { isLoading, data: invoicedDataList } = useQuery({
    queryKey: [invoiceApi.getInvoices.endpointKey, orderId],
    queryFn: () => getInvoices(orderId, filterData.page, filterData.limit),
    select: (data) => data.data.data,
  });

  // Sort the invoicedDataList by createdAt in descending order : latest invoice shows first
  const sortedInvoicedDataList = invoicedDataList?.data?.sort(
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
    <>
      <div className="scrollBarStyles flex max-h-[55vh] flex-col gap-4 overflow-auto">
        {sortedInvoicedDataList && sortedInvoicedDataList.length > 0 ? (
          sortedInvoicedDataList.map((invoice) => {
            // Check if the invoiceId from searchParams matches the current invoice.id
            const shouldOpenModal = String(invoice.id) === String(invoiceId);

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
                    invoiceId={invoice.id}
                    pvtUrl={invoice?.attachmentLink}
                    shouldOpen={shouldOpenModal} // Automatically open this modal if invoiceId matches
                  />
                </section>

                <DataTable
                  columns={invoiceColumns}
                  data={invoice?.invoiceItems}
                />
                {/* 
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
                </div> */}
              </div>
            );
          })
        ) : (
          <div className="flex h-[50rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
            <Image src={emptyImg} alt="emptyIcon" />
            <p className="font-bold">No invoices yet</p>
            <p className="max-w-96 text-center">
              {
                "You haven't created any invoices yet. Start by generating your first invoice to keep track of your transactions"
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
