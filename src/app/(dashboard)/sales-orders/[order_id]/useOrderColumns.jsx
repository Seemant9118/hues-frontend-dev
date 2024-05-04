"use client";

import { order_api } from "@/api/order_api/order_api";
import ChangeOfferPrice from "@/components/Modals/ChangeOfferPrice";
import OfferPrice from "@/components/Modals/OfferPrice";
import SuccessModal from "@/components/Modals/SuccessModal";
import Tooltips from "@/components/Tooltips";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";
import { AccpetRejectNegotiation } from "@/services/Orders_Services/Orders_Services";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Check, Info, RotateCw } from "lucide-react";
import { useParams } from "next/navigation";

export const useOrderColumns = () => {
  const params = useParams();
  const order_id = params.order_id;
  const queryClient = useQueryClient();

  const mutationAccept = useMutation({
    mutationFn: (data) => AccpetRejectNegotiation(data),
    onSuccess: () => {
      toast.success("Accepted current negotiation Price");
      queryClient.invalidateQueries([order_api.getOrderDetails.endpointKey]);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleAcceptNegotiation = (row) => {

    mutationAccept.mutate({
      order_id: order_id,
      item_id: row.id,
      status: "ACCEPTED",
    });
  };
  return [
    {
      accessorKey: "item",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ITEMS" />
      ),
      cell: ({ row }) => {
        const productType = row.original.productType;
        const name =
          productType === "GOODS"
            ? row.original.productDetails.productName
            : row.original.productDetails.serviceName;
        return name;
      },
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="QUANTITY" />
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="PRICE" />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("totalAmount"));

        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "INR",
        }).format(amount);
        return <div className="font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "negotiationStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="STATUS" />
      ),
      cell: ({ row }) => {
        const status = row.original.negotiationStatus;
        const offerDetails = row.original;

        let statusText,
          statusColor,
          statusBG,
          statusBorder,
          btnName,
          actionBtn,
          tooltip;
        switch (status) {
          case "ACCEPTED":
            statusText = "Accepted";
            statusColor = "#39C06F";
            statusBG = "#39C06F1A";
            statusBorder = "#39C06F";
            break;
          case "NEW":
            statusText = "New";
            statusColor = "#1863B7";
            statusBG = "#1863B71A";
            statusBorder = "#1863B7";
            btnName = "Offer Price";
            break;
          case "NEGOTIATION":
            statusText = "Negotiation";
            statusColor = "#F8BA05";
            statusBG = "#F8BA051A";
            statusBorder = "#F8BA05";
            actionBtn = "action";
            tooltip = (
              <Tooltips trigger={<Info size={14} />} isContentShow="true" />
            );
            break;
          default:
            return null;
        }

        return (
          <div className="flex justify-between items-center">
            <div
              className="max-w-fit px-1.5 py-2 flex justify-center items-center font-bold border rounded gap-1"
              style={{
                color: statusColor,
                backgroundColor: statusBG,
                border: statusBorder,
              }}
            >
              {statusText} {tooltip}
            </div>

            {btnName && (
              <OfferPrice btnName={btnName} offerDetails={offerDetails} />
            )}

            {actionBtn && (
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
          </div>
        );
      },
    },
  ];
};
