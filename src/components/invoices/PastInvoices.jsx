import { invoiceApi } from '@/api/invoice/invoiceApi';
import { formattedAmount } from '@/appUtils/helperFunctions';
import { getInvoices } from '@/services/Invoice_Services/Invoice_Services';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';
import emptyImg from '../../../public/Empty.png';
import InvoicePDFViewModal from '../Modals/InvoicePDFViewModal';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import Wrapper from '../wrappers/Wrapper';

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

  // fn for capitalization
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  if (isInvoicesLoading) {
    return <Loading />;
  }

  return (
    <Wrapper className="h-full">
      <div className="flex flex-col gap-4">
        {invoiceList && invoiceList?.length > 0 ? (
          invoiceList?.map((invoice) => {
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
                          {formattedAmount(invoice?.totalAmount)}
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

                  <InvoicePDFViewModal Url={invoice?.attachmentLink} />
                </section>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
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
                  size="sm"
                  className="bg-[#288AF9]"
                  onClick={() => setIsGenerateInvoice(true)}
                >
                  Generate Invoice
                </Button>
              )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export default PastInvoices;
