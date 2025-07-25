import { invoiceApi } from '@/api/invoice/invoiceApi';
import { formattedAmount } from '@/appUtils/helperFunctions';
import { useRouter } from '@/i18n/routing';
import { getInvoices } from '@/services/Invoice_Services/Invoice_Services';
import { viewPdfInNewTab } from '@/services/Template_Services/Template_Services';
import { useQuery } from '@tanstack/react-query';
import { Eye, MoveUpRight } from 'lucide-react';
import moment from 'moment';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';
import emptyImg from '../../../public/Empty.png';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import Wrapper from '../wrappers/Wrapper';
import { ProtectedWrapper } from '../wrappers/ProtectedWrapper';

function PastInvoices({ setIsGenerateInvoice, orderDetails }) {
  const translations = useTranslations('components.past_invoices');
  const router = useRouter();
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

  // redirect to invoice details page
  function invoiceDetailsPage(invoiceId) {
    if (isPurchasesPage) {
      router.push(`/dashboard/purchases/purchase-invoices/${invoiceId}`);
    } else {
      router.push(`/dashboard/sales/sales-invoices/${invoiceId}`);
    }
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
                    <h1
                      onClick={() => invoiceDetailsPage(invoice?.id)}
                      className="flex cursor-pointer items-center gap-1 text-sm font-bold hover:text-primary hover:underline"
                    >
                      {invoice?.referenceNumber} <MoveUpRight size={12} />
                    </h1>
                    <div className="flex gap-10">
                      <h1 className="text-sm">
                        <span className="font-bold text-[#ABB0C1]">
                          {translations('label.date')} :{' '}
                        </span>
                        <span className="text-[#363940]">
                          {moment(invoice?.createdAt).format('DD-MM-YYYY')}
                        </span>
                      </h1>
                      <h1 className="text-sm">
                        <span className="font-bold text-[#ABB0C1]">
                          {translations('label.total_amount')} :{' '}
                        </span>
                        <span className="font-bold text-[#363940]">
                          {formattedAmount(invoice?.totalAmount)}
                        </span>
                        <span> (inc. GST)</span>
                      </h1>
                      <h1 className="text-sm font-bold">
                        <span className="font-bold text-[#ABB0C1]">
                          {translations('label.type')} :{' '}
                        </span>
                        <span className="font-bold text-[#363940]">
                          {capitalize(invoice?.invoiceType)}
                        </span>
                      </h1>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewPdfInNewTab(invoice?.attachmentLink)}
                  >
                    <Eye size={14} />
                  </Button>
                </section>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
            <Image src={emptyImg} alt="emptyIcon" />
            <p className="font-bold">
              {translations('emptyStateComponent.title')}
            </p>
            <ProtectedWrapper
              permissionCode={'permission:sales-invoice-create'}
            >
              <p className="max-w-96 text-center">
                {translations('emptyStateComponent.para')}
              </p>
            </ProtectedWrapper>

            {!isPurchasesPage &&
              !orderDetails?.invoiceGenerationCompleted &&
              (orderDetails.negotiationStatus === 'ACCEPTED' ||
                (orderDetails.negotiationStatus === 'NEW' &&
                  orderDetails?.orderType === 'SALES')) && (
                <ProtectedWrapper
                  permissionCode={'permission:sales-invoice-create'}
                >
                  <Button
                    size="sm"
                    className="bg-[#288AF9]"
                    onClick={() => setIsGenerateInvoice(true)}
                  >
                    {translations('emptyStateComponent.ctas.generate_invoice')}
                  </Button>
                </ProtectedWrapper>
              )}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export default PastInvoices;
