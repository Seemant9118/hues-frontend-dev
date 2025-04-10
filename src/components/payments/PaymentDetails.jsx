import { paymentApi } from '@/api/payments/payment_api';
import { getPaymentsFromOrder } from '@/services/Payment_Services/PaymentServices';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import emptyImg from '../../../public/Empty.png';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import { usePaymentColumns } from './paymentColumns';

const PaymentDetails = ({ orderId, orderDetails, setIsRecordingPayment }) => {
  const translations = useTranslations('components.payment_details');
  const router = useRouter();
  const pathName = usePathname();
  const isPurchasesPage = pathName.includes('purchase-orders');

  // FETCH API PAYMENTS_LIST
  const { data: paymentsList, isLoading: isPaymentsLoading } = useQuery({
    queryKey: [paymentApi.getPaymentsFromOrder.endpointKey, orderId],
    queryFn: () => getPaymentsFromOrder(orderId),
    select: (paymentsList) => paymentsList?.data?.data,
  });

  const onRowClick = (row) => {
    if (pathName.includes('sales')) {
      router.push(`/sales/sales-payments/${row.paymentid}`);
    } else {
      router.push(`/purchases/purchase-payments/${row.paymentid}`);
    }
  };

  const paymentColumns = usePaymentColumns();

  if (isPaymentsLoading) {
    return <Loading />;
  }

  return paymentsList?.length > 0 ? (
    <DataTable
      onRowClick={onRowClick}
      columns={paymentColumns}
      data={paymentsList}
    />
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-[#939090]">
      <Image src={emptyImg} alt="emptyIcon" />
      <p className="font-bold">{translations('emptyStateComponent.title')}</p>
      <p className="max-w-96 text-center">
        {translations('emptyStateComponent.para')}
      </p>

      {!isPurchasesPage && orderDetails.negotiationStatus === 'INVOICED' && (
        <Button
          size="sm"
          className="bg-[#288AF9]"
          onClick={() => setIsRecordingPayment(true)}
        >
          {translations('ctas.record_payment')}
        </Button>
      )}
    </div>
  );
};

export default PaymentDetails;
