import { paymentApi } from '@/api/payments/payment_api';
import { getPaymentsList } from '@/services/Payment_Services/PaymentServices';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React from 'react';
import emptyImg from '../../../public/Empty.png';
import { DataTable } from '../table/data-table';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import { usePaymentColumns } from './paymentColumns';

const PaymentDetails = ({
  orderId,
  orderDetails,
  setIsRecordingPayment,
  filterData,
}) => {
  const pathName = usePathname();
  const isPurchasesPage = pathName.includes('purchase-orders');

  const { data: paymentsList, isLoading } = useQuery({
    queryKey: [paymentApi.getPaymentsList.endpointKey, orderId],
    queryFn: () => getPaymentsList(orderId, filterData.page, filterData.limit), // Make sure you're passing the orderId correctly
    enabled: !!orderId, // Ensure the query only runs if orderId is truthy
    select: (paymentsList) => paymentsList.data.data,
  });

  const paymentColumns = usePaymentColumns();

  if (isLoading) {
    return <Loading />;
  }

  return paymentsList?.length > 0 ? (
    <DataTable columns={paymentColumns} data={paymentsList}></DataTable>
  ) : (
    <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
      <Image src={emptyImg} alt="emptyIcon" />
      <p className="font-bold">No payments yet</p>
      <p className="max-w-96 text-center">
        {
          "You haven't created any payments yet. Start by generating your first payment to keep track of your transactions"
        }
      </p>

      {!isPurchasesPage && orderDetails.negotiationStatus === 'INVOICED' && (
        <Button
          className="bg-[#288AF9]"
          onClick={() => setIsRecordingPayment(true)}
        >
          Record Payment
        </Button>
      )}
    </div>
  );
};

export default PaymentDetails;
