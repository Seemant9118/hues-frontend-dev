'use client';

import { orderApi } from '@/api/order_api/order_api';
import ChangeOfferPrice from '@/components/Modals/ChangeOfferPrice';
import ToolTipOrder from '@/components/orders/ToolTipOrder';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';
import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import { AccpetRejectNegotiation } from '@/services/Orders_Services/Orders_Services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Info } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';

export const useSalesOrderColumns = (
  buyerEnterpriseId,
  sellerEnterpriseId,
  orderType,
) => {
  const params = useParams();
  const orderId = params.order_id;
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const queryClient = useQueryClient();

  const mutationAccept = useMutation({
    mutationFn: (data) => AccpetRejectNegotiation(data),
    onSuccess: () => {
      toast.success('Accepted current negotiation Price');
      queryClient.invalidateQueries([orderApi.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleAcceptNegotiation = (row) => {
    mutationAccept.mutate({
      orderId,
      itemId: row.id,
      status: 'ACCEPTED',
    });
  };
  return [
    {
      accessorKey: 'item',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEMS" />
      ),
      cell: ({ row }) => {
        const { productType } = row.original;
        const name =
          productType === 'GOODS'
            ? row.original.productDetails.productName
            : row.original.productDetails.serviceName;
        return name;
      },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ORIGINAL PRICE" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue('totalAmount'));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ASKING PRICE" />
      ),
      cell: ({ row }) => {
        const price = row.original?.negotiation?.price;

        const amount = parseFloat(price);

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'INR',
        }).format(amount);

        return price ? (
          <div className="font-medium">{formatted}</div>
        ) : (
          <div className="text-lg font-bold">-</div>
        );
      },
    },
    {
      accessorKey: 'negotiationStatus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const status = row.original.negotiationStatus;
        const negoStatus = row.original?.negotiation?.status;
        const offerDetails = row.original;

        let statusText;
        let statusColor;
        let statusBG;
        let statusBorder;
        let tooltip;
        switch (status) {
          case 'ACCEPTED':
            statusText = 'Accepted';
            statusColor = '#39C06F';
            statusBG = '#39C06F1A';
            statusBorder = '#39C06F';
            break;
          case 'NEW':
            statusText = 'New';
            statusColor = '#1863B7';
            statusBG = '#1863B71A';
            statusBorder = '#1863B7';

            break;
          case 'NEGOTIATION':
            statusText = negoStatus;
            statusColor = '#F8BA05';
            statusBG = '#F8BA051A';
            statusBorder = '#F8BA05';
            tooltip = (
              <ToolTipOrder
                trigger={<Info size={14} />}
                offerDetails={offerDetails}
              />
            );
            break;
          default:
            return null;
        }

        return (
          <div className="flex items-center justify-between">
            <div
              className="flex max-w-fit items-center justify-center gap-1 rounded border px-1.5 py-2 font-bold"
              style={{
                color: statusColor,
                backgroundColor: statusBG,
                border: statusBorder,
              }}
            >
              {statusText} {tooltip}
            </div>

            {/* status NEW */}
            {status === 'NEW' && sellerEnterpriseId === enterpriseId && (
              <>
                {orderType === 'SALES' && (
                  <span className="rounded-md border border-yellow-500 bg-yellow-50 p-2 font-bold text-yellow-500">
                    Waiting for Response
                  </span>
                )}

                {orderType === 'PURCHASE' && (
                  <div className="flex items-center gap-1">
                    <ChangeOfferPrice offerDetails={offerDetails} />

                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptNegotiation(offerDetails)}
                    >
                      <Check size={24} strokeWidth={3} />
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* status NEGOTIATION */}
            {status === 'NEGOTIATION' &&
              sellerEnterpriseId === enterpriseId && (
                <>
                  {negoStatus === 'BID_SUBMITTED' && (
                    <div className="flex items-center gap-1">
                      <ChangeOfferPrice offerDetails={offerDetails} />

                      <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptNegotiation(offerDetails)}
                      >
                        <Check size={24} strokeWidth={3} />
                      </Button>
                    </div>
                  )}
                  {negoStatus === 'OFFER_SUBMITTED' && (
                    <span className="rounded-md border border-yellow-500 bg-yellow-50 p-2 font-bold text-yellow-500">
                      Waiting for Response
                    </span>
                  )}
                </>
              )}
          </div>
        );
      },
    },
  ];
};
