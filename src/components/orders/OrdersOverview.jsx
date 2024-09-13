import { MoveUpRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { Progress } from '../ui/progress';

const OrdersOverview = ({
  orderId,
  multiStatus,
  Name,
  paid = 100,
  totalAmount = 150000,
}) => {
  const pathName = usePathname();
  const isSalesDetailPage = pathName.includes('/sales-orders');

  // Format the amount as a dollar amount
  const formatAmountIntoRupee = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
    return formatted;
  };

  const paymentProgressPercent = (paid / totalAmount) * 100;
  return (
    <section className="flex h-48 gap-2 rounded-md border p-5">
      <div className="flex w-1/2 flex-col gap-4">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Order ID</p>
          <p className="text-lg font-bold">{orderId}</p>
        </section>

        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">
            {isSalesDetailPage ? 'Client' : 'Vendor'} Name
          </p>
          <p className="text-lg font-bold">{Name ?? 'Name not available'}</p>
          <p className="text-xs font-bold text-[#A5ABBD]">+91 7317414272</p>
        </section>
      </div>
      <div className="flex w-1/2 flex-col gap-4">
        <section className="flex flex-col gap-4">
          <p className="text-xs font-bold">Order Status</p>
          <p>{multiStatus}</p>
        </section>

        <section className="flex flex-col gap-5">
          <p className="text-xs font-bold">Payment Status</p>
          <Progress
            className="w-3/4 bg-[#F3F3F3]"
            value={paymentProgressPercent}
          />
          <p className="text-xs font-bold text-[#A5ABBD]">{`${formatAmountIntoRupee(paid)} of ${formatAmountIntoRupee(totalAmount)}`}</p>
        </section>
      </div>
      <div className="flex w-1/2 flex-col items-end gap-4">
        <section className="flex flex-col gap-4">
          <p className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#288AF9] hover:underline">
            View Negotiation <MoveUpRight size={12} />
          </p>
        </section>
      </div>
    </section>
  );
};

export default OrdersOverview;
