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
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import emptyImg from '../../../../../../public/Empty.png';

const PurchasePayments = () => {
  useMetaData('Hues! - Purchase Payments', 'HUES PAYMENTS'); // dynamic title

  const translations = useTranslations('purchases.purchase-payments');

  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreatePaymentAdvice, setIsCreatePaymentAdvice] = useState(false);

  // const paymentColumns = usePaymentsColumn();

  const purchasePaymentsBreadCrumbs = [
    {
      id: 1,
      name: 'purchases.purchase-payments.title',
      path: '/purchases/purchase-payments',
      show: true, // Always show
    },
    {
      id: 1,
      name: 'purchases.purchase-payments.title2',
      path: '/purchases/purchase-payments',
      show: isCreatePaymentAdvice, // Always show
    },
  ];

  useEffect(() => {
    // Read the state from the query parameters
    const action = searchParams.get('action');
    setIsCreatePaymentAdvice(action === 'create');
  }, [searchParams]);

  useEffect(() => {
    // Update URL based on the state (avoid shallow navigation for full update)
    let newPath = `/purchases/purchase-payments`;

    if (isCreatePaymentAdvice) {
      newPath += '?action=create';
    } else {
      newPath += '';
    }
    // Use router.replace instead of push to avoid adding a new history entry
    router.push(newPath);
  }, [isCreatePaymentAdvice, router]);

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
                possiblePagesBreadcrumbs={purchasePaymentsBreadCrumbs}
              />
            </div>
            {!isCreatePaymentAdvice && (
              <div className="flex gap-2">
                <Tooltips
                  trigger={
                    <Button
                      onClick={() => setIsCreatePaymentAdvice(true)}
                      size="sm"
                    >
                      {translations('ctas.create_payment_advice.cta')}
                    </Button>
                  }
                  content={translations(
                    'ctas.create_payment_advice.placeholder',
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

          {!isCreatePaymentAdvice && (
            <section>
              {/* Loading state */}
              {/* {isPaymentsLoading && <Loading />} */}

              {/* Table when data is available */}
              {/* {!isPaymentsLoading && paymentsListing?.length > 0 && (
              <PurchaseTable
                id="purchase-debit-note-accepted"
                columns={paymentColumns}
                data={[]}
                fetchNextPage={fetchNextPage}
                isFetching={isFetching}
                totalPages={paginationData?.totalPages}
                currFetchedPage={paginationData?.currFetchedPage}
                onRowClick={onRowClick}
                lastPurchaseDebitNotesRef={lastPurchasePaymentsRef}
              />
            )} */}

              {/* Empty state */}
              <div className="flex h-[38rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
                <Image src={emptyImg} alt="emptyIcon" />
                <p className="text-lg font-bold text-black">
                  {translations('emptyStateComponent.heading')}
                </p>
                <p className="w-1/3 text-center">
                  {translations('emptyStateComponent.description')}
                </p>
                <Button
                  onClick={() => setIsCreatePaymentAdvice(true)}
                  size="sm"
                >
                  {translations('ctas.create_payment_advice.cta')}
                </Button>
              </div>
            </section>
          )}

          {isCreatePaymentAdvice && (
            <MakePaymentNew
              orderId="1"
              orderDetails=""
              setIsRecordingPayment={setIsCreatePaymentAdvice}
            />
          )}
        </Wrapper>
      )}
    </>
  );
};

export default PurchasePayments;
