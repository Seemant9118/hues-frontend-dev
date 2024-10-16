import { paymentApi } from '@/api/payments/payment_api';
import { getPaymentsList } from '@/services/Payment_Services/PaymentServices';
import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import emptyImg from '../../../public/Empty.png';
import { InfiniteDataTable } from '../table/infinite-data-table';
import { Button } from '../ui/button';
import Loading from '../ui/Loading';
import { usePaymentColumns } from './paymentColumns';

// macros
const PAGE_LIMIT = 10;

const PaymentDetails = ({ orderId, orderDetails, setIsRecordingPayment }) => {
  const pathName = usePathname();
  const isPurchasesPage = pathName.includes('purchase-orders');
  const [paginationData, setPaginationData] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterData, setFilterData] = useState(null);

  const getPaymentsMutation = useMutation({
    mutationKey: [paymentApi.getPaymentsList.endpointKey, orderId],
    mutationFn: getPaymentsList,
    onSuccess: (data) => {
      const _newPaymentsData = data.data.data.data;
      setPaginationData(data.data.data);

      if (filterData) {
        setPayments(_newPaymentsData);
      } else {
        setPayments([...payments, ..._newPaymentsData]);
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    },
  });

  useEffect(() => {
    if (orderId) {
      let _reqFilters = {
        page: 1,
        limit: PAGE_LIMIT,
      };
      if (filterData) {
        _reqFilters = {
          ..._reqFilters,
          ...filterData,
        };
      } else {
        _reqFilters.page = currentPage;
      }
      getPaymentsMutation.mutate({
        id: orderId,
        data: _reqFilters,
      });
    }
  }, [filterData, orderId, currentPage]);

  const paymentColumns = usePaymentColumns();

  if (getPaymentsMutation.isPending) {
    return <Loading />;
  }

  return payments?.length > 0 ? (
    <InfiniteDataTable
      columns={paymentColumns}
      data={payments}
      filterData={filterData}
      setFilterData={setFilterData}
      setCurrentPage={setCurrentPage}
      paginationData={paginationData}
    ></InfiniteDataTable>
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
