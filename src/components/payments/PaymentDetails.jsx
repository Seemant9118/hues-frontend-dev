import { paymentApi } from '@/api/payments/payment_api';
import { getPaymentsList } from '@/services/Payment_Services/PaymentServices';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import React from 'react';
import { DataTable } from '../table/data-table';
import Loading from '../ui/Loading';
import emptyImg from '../../../public/Empty.png';
import { paymentColumns } from './paymentColumns';
import { Button } from '../ui/button';

const PaymentDetails = ({ orderId, orderDetails, setIsRecordingPayment }) => {
  const { data: paymentsList, isLoading } = useQuery({
    queryKey: [paymentApi.getPaymentsList.endpointKey, orderId],
    queryFn: () => getPaymentsList(orderId), // Make sure you're passing the orderId correctly
    enabled: !!orderId, // Ensure the query only runs if orderId is truthy
  });

  if (isLoading) {
    return <Loading />;
  }

  return paymentsList?.data?.length > 0 ? (
    <DataTable columns={paymentColumns} data={paymentsList.data}></DataTable>
  ) : (
    <div className="flex h-[26rem] flex-col items-center justify-center gap-2 rounded-lg border bg-gray-50 p-4 text-[#939090]">
      <Image src={emptyImg} alt="emptyIcon" />
      <p className="font-bold">No payments yet</p>
      <p className="max-w-96 text-center">
        {
          "You haven't created any payments yet. Start by generating your first payment to keep track of your transactions"
        }
      </p>

      {(orderDetails.negotiationStatus === 'INVOICED' ||
        orderDetails.negotiationStatus === 'ACCEPTED') && (
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
