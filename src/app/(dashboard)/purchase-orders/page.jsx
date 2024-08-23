'use client';

import { orderApi } from '@/api/order_api/order_api';
import { DataTable } from '@/components/table/data-table';
import EmptyStageComponent from '@/components/ui/EmptyStageComponent';
import Loading from '@/components/ui/Loading';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService, exportTableToExcel } from '@/lib/utils';
import { GetPurchases } from '@/services/Orders_Services/Orders_Services';
import { useQuery } from '@tanstack/react-query';
import {
  DatabaseZap,
  FileCheck,
  KeySquare,
  PlusCircle,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { usePurchaseColumns } from './usePurchaseColumns';

// dynamic imports
const CreateOrder = dynamic(() => import('@/components/orders/CreateOrder'), {
  loading: () => <Loading />,
});

const EditOrder = dynamic(() => import('@/components/orders/EditOrder'), {
  loading: () => <Loading />,
});

const PurchaseOrders = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const PurchaseEmptyStageData = {
    heading: `~"Simplify purchasing: from bids to invoices with digital negotiations and signatures, ensuring
    transparency and ease."`,
    subHeading: 'Features',
    subItems: [
      {
        id: 1,
        icon: <KeySquare size={14} />,
        subItemtitle: `Engage vendors with bids or receive offers on a unified platform.`,
      },
      {
        id: 2,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Securely negotiate and finalize purchases with digital signatures.`,
      },
      {
        id: 3,
        icon: <ShieldCheck size={14} />,
        subItemtitle: `Generate and organize invoices automatically or manually for precise tracking.`,
      },
      {
        id: 4,
        icon: <FileCheck size={14} />,
        subItemtitle: `Streamline internal and external financial processes with easy payment advice.`,
      },
    ],
  };

  const onRowClick = (row) => {
    router.push(`/purchase-orders/${row.id}`);
  };

  const PurchaseColumns = usePurchaseColumns(setIsEditingOrder, setOrderId);

  const { isLoading, data } = useQuery({
    queryKey: [orderApi.getPurchases.endpointKey],
    queryFn: () => GetPurchases(enterpriseId),
    select: (res) => res.data.data,
  });

  return (
    <>
      {!isCreatingPurchase && !isEditingOrder && (
        <Wrapper>
          <SubHeader name={'Purchases'} className="z-10 bg-white">
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() =>
                  exportTableToExcel('purchase-orders', 'purchases_list', false)
                }
                variant={'blue_outline'}
                className="border-neutral-300 bg-neutral-500/10 text-neutral-600 hover:bg-neutral-600/10"
                size="sm"
              >
                <Upload size={14} />
                Export
              </Button>
              <Button
                onClick={() => setIsCreatingPurchase(true)}
                variant={'blue_outline'}
                size="sm"
              >
                <PlusCircle size={14} />
                Bid
              </Button>
            </div>
          </SubHeader>

          {isLoading && <Loading />}

          {!isLoading &&
            (data && data?.length > 0 ? (
              <DataTable
                id={'sale-orders'}
                columns={PurchaseColumns}
                onRowClick={onRowClick}
                data={data}
              />
            ) : (
              <EmptyStageComponent
                heading={PurchaseEmptyStageData.heading}
                desc={PurchaseEmptyStageData.desc}
                subHeading={PurchaseEmptyStageData.subHeading}
                subItems={PurchaseEmptyStageData.subItems}
              />
            ))}
        </Wrapper>
      )}
      {isCreatingPurchase && !isEditingOrder && (
        <CreateOrder
          type="purchase"
          name={'Bid'}
          cta="bid"
          isOrder="order"
          onCancel={() => setIsCreatingPurchase(false)}
          onSubmit={() => {
            setIsCreatingPurchase(false);
          }}
        />
      )}

      {isEditingOrder && !isCreatingPurchase && (
        <EditOrder
          type="purchase"
          name="Edit"
          cta="purchase"
          orderId={orderId}
          onCancel={() => setIsEditingOrder(false)}
        />
      )}
    </>
  );
};

export default PurchaseOrders;
