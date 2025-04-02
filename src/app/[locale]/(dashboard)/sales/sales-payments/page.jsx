'use client';

import Tooltips from '@/components/auth/Tooltips';
import OrderBreadCrumbs from '@/components/orders/OrderBreadCrumbs';
import MakePaymentNew from '@/components/payments/MakePaymentNew';
import { Button } from '@/components/ui/button';
import RestrictedComponent from '@/components/ui/RestrictedComponent';
import SubHeader from '@/components/ui/Sub-header';
import Wrapper from '@/components/wrappers/Wrapper';
import useMetaData from '@/custom-hooks/useMetaData';
import { LocalStorageService } from '@/lib/utils';
import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { PurchaseTable } from '../../purchases/purchasetable/PurchaseTable';
import { usePaymentsColumn } from './usePaymentsColumn';

const SalesPayments = () => {
  useMetaData('Hues! - Sales Payments', 'HUES PAYMENTS'); // dynamic title

  const translations = useTranslations('sales.sales-payments');

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreatePaymentRecord, setIsCreatePaymentRecord] = useState(false);

  const salesPaymentsBreadCrumbs = [
    {
      id: 1,
      name: 'sales.sales-payments.title',
      path: '/sales/sales-payments',
      show: true, // Always show
    },
    {
      id: 1,
      name: 'sales.sales-payments.title2',
      path: '/sales/sales-payments',
      show: isCreatePaymentRecord, // Always show
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const action = searchParams.get('action');
    setIsCreatePaymentRecord(action === 'create');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/sales/sales-payments`;

    if (isCreatePaymentRecord) {
      newPath += '?action=create';
    } else {
      newPath += '';
    }
    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [isCreatePaymentRecord, router]);

  const onRowClick = (row) => {
    router.push(`/sales/sales-payments/${row.id}`);
  };

  const paymentColumns = usePaymentsColumn();

  const data = [
    {
      paymentId: 'PO123',
      vendorName: 'KBC Enterprise',
      invoiceId: 'JQQRXF/INV1234568934839',
      totalAmount: '439',
      amountPaid: '439',
      modeOfPayment: 'Bank Transfer',
      paymentDate: '23/02/2025',
      status: 'Pending',
    },
    {
      paymentId: 'PO123',
      vendorName: 'KBC Enterprise',
      invoiceId: 'JQQRXF/INV1234568934839',
      totalAmount: '1000',
      amountPaid: '590',
      modeOfPayment: 'Bank Transfer',
      paymentDate: '23/02/2025',
      status: 'Approved',
    },
    {
      paymentId: 'PO123',
      vendorName: 'KBC Enterprise',
      invoiceId: 'JQQRXF/INV1234568934839',
      totalAmount: '439',
      amountPaid: '439',
      modeOfPayment: 'Bank Transfer',
      paymentDate: '23/02/2025',
      status: 'Rejected',
    },
  ];

  return (
    <>
      {(!enterpriseId || !isEnterpriseOnboardingComplete) && (
        <Wrapper>
          <SubHeader name={translations('title')} />
          <RestrictedComponent />
        </Wrapper>
      )}

      {enterpriseId && isEnterpriseOnboardingComplete && (
        <Wrapper>
          <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
            <div className="flex gap-2">
              {/* Breadcrumbs */}
              <OrderBreadCrumbs
                possiblePagesBreadcrumbs={salesPaymentsBreadCrumbs}
              />
            </div>
            {!isCreatePaymentRecord && (
              <div className="flex gap-2">
                <Tooltips
                  trigger={
                    <Button
                      onClick={() => setIsCreatePaymentRecord(true)}
                      size="sm"
                    >
                      {translations('ctas.create_payment_record.cta')}
                    </Button>
                  }
                  content={translations(
                    'ctas.create_payment_record.placeholder',
                  )}
                />
                <Tooltips
                  trigger={
                    <Button
                      onClick={() => {}}
                      variant="outline"
                      className="border border-[#A5ABBD] hover:bg-neutral-600/10"
                      size="sm"
                    >
                      <Download size={14} />
                    </Button>
                  }
                  content={translations('ctas.export.placeholder')}
                />
              </div>
            )}
          </section>

          {!isCreatePaymentRecord && (
            <section>
              {/* Loading state */}
              {/* {isPaymentsLoading && <Loading />} */}

              {/* Table when data is available */}
              {/* {!isPaymentsLoading && paymentsListing?.length > 0 && (
              )} */}
              <PurchaseTable
                id="purchase-debit-note-accepted"
                columns={paymentColumns}
                data={data}
                // fetchNextPage={fetchNextPage}
                // isFetching={isFetching}
                // totalPages={paginationData?.totalPages}
                // currFetchedPage={paginationData?.currFetchedPage}
                // lastPurchaseDebitNotesRef={lastPurchasePaymentsRef}
                onRowClick={onRowClick}
              />

              {/* Empty state */}
              {/* <div className="flex h-[38rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p className="text-lg font-bold text-black">
                  {translations('emptyStateComponent.heading')}
                </p>
                <p className="w-1/3 text-center">
                  {translations('emptyStateComponent.description')}
                </p>
                <Button
                  onClick={() => setIsCreatePaymentRecord(true)}
                  size="sm"
                >
                  {translations('ctas.create_payment_record.cta')}
                </Button>
              </div> */}
            </section>
          )}

          {isCreatePaymentRecord && (
            <MakePaymentNew
              orderId="1"
              orderDetails=""
              setIsRecordingPayment={setIsCreatePaymentRecord}
            />
          )}
        </Wrapper>
      )}
    </>
  );
};

export default SalesPayments;
