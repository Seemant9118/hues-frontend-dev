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

  const paymentProgressPercent = (paid / totalAmount) * 100;
  return (
    <section className="flex h-48 gap-2 rounded-md border p-5">
      <div className="flex w-1/2 flex-col gap-4">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">Order ID</p>
          <p className="text-lg font-bold">{orderId}</p>
        </section>
        <section className="flex flex-col gap-4">
          <p className="text-xs font-bold">Order Status</p>
          <p>{multiStatus}</p>
        </section>
      </div>
      <div className="flex w-1/2 flex-col gap-4">
        <section className="flex flex-col gap-2">
          <p className="text-xs font-bold">
            {isSalesDetailPage ? 'Client' : 'Vendor'} Name
          </p>
          <p className="text-lg font-bold">{Name ?? 'Name not available'}</p>
        </section>
        <section className="flex flex-col gap-5">
          <p className="text-xs font-bold">Payment Status</p>
          <Progress
            className="w-1/3 bg-[#F3F3F3]"
            value={paymentProgressPercent}
          />
          <p className="text-xs font-bold">{`₹${paid} of ₹${totalAmount}`}</p>
        </section>
      </div>
    </section>
  );
};

export default OrdersOverview;
