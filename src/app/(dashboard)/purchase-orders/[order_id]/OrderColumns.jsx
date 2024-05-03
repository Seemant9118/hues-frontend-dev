import ChangeOfferPrice from "@/components/Modals/ChangeOfferPrice";
import OfferPrice from "@/components/Modals/OfferPrice";
import SuccessModal from "@/components/Modals/SuccessModal";
import Tooltips from "@/components/Tooltips";
import { DataTableColumnHeader } from "@/components/table/DataTableColumnHeader";
import { Button } from "@/components/ui/button";

import { Check, Info, RotateCw } from "lucide-react";

export const OrderColumns = [
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
            className="w-24 p-1 flex justify-center items-center font-bold border rounded gap-1"
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
              <ChangeOfferPrice />
              <SuccessModal cta="offer-confirmation" onClose={() => {}}>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Check size={24} strokeWidth={3} />
                </Button>
              </SuccessModal>
            </div>
          )}
        </div>
      );
    },
  },
];
