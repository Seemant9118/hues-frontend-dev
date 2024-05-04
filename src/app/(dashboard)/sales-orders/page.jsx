"use client";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import {
  CloudFog,
  DatabaseZap,
  FileCheck,
  FileText,
  FolderUp,
  KeySquare,
  PlusCircle,
} from "lucide-react";
import React, { useState } from "react";
import { useSalesColumns } from "./SalesColumns";
import CreateOrder from "@/components/CreateOrder";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ViewOrder from "./[order_id]/page";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { order_api } from "@/api/order_api/order_api";
import { GetSales } from "@/services/Orders_Services/Orders_Services";
import { LocalStorageService } from "@/lib/utils";

const SalesOrder = () => {
  const router = useRouter();
  const enterprise_id = LocalStorageService.get("enterprise_Id");

  const [orders, setOrders] = useState([]);
  const [istype, setIsType] = useState("All");
  const [isCreatingSales, setIsCreatingSales] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isOrderView, setIsOrderView] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const SaleEmptyStageData = {
    heading: `~"Seamlessly manage sales, from bids to digital negotiations and secure invoicing with digital
    signatures."`,
    subHeading: "Features",
    subItems: [
      {
        id: 1,
        icon: <FileCheck size={14} />,
        subItemtitle: `Initiate sales and deals by receiving bids or making offers.`,
      },
      // { id: 2, subItemtitle: `Maximize impact by making or receiving offers on your catalogue.` },
      {
        id: 3,
        icon: <FileText size={14} />,
        subItemtitle: `Securely negotiate with digitally signed counter-offers and bids.`,
      },
      {
        id: 4,
        icon: <KeySquare size={14} />,
        subItemtitle: `Finalize deals with mutual digital signatures for binding commitment.`,
      },
      {
        id: 5,
        icon: <DatabaseZap size={14} />,
        subItemtitle: `Effortlessly create and share detailed invoices, completing sales professionally. `,
      },
    ],
  };

  const SalesColumns = useSalesColumns(setIsOrderView);

  const onRowClick = (row) => {
    router.push(`/sales-orders/${row.id}`);
  };

  const { data, isSuccess } = useQuery({
    queryKey: [order_api.getSales.endpointKey],
    queryFn: () => GetSales(enterprise_id),
    select: (data) => data.data.data,
  });


  return (
    <>
      {!isCreatingSales && !isCreatingInvoice && (
        <Wrapper>
          <SubHeader name={"Sales"}>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-4">
                <Select
                  value={istype.type}
                  onValueChange={(value) => setIsType(value)}
                >
                  <SelectTrigger className="max-w-xs gap-5">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Bid">Bids</SelectItem>
                    <SelectItem value="offer">Offers</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant={"blue_outline"}
                className="bg-neutral-500/10 text-neutral-600 border-neutral-300 hover:bg-neutral-600/10"
                size="sm"
              >
                <FolderUp size={14} />
                Export
              </Button>
              <Button
                onClick={() => setIsCreatingSales(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <PlusCircle size={14} />
                Offer
              </Button>
              <Button
                onClick={() => setIsCreatingInvoice(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <PlusCircle size={14} />
                Invoice
              </Button>
            </div>
          </SubHeader>
          {data?.length === 0 ? (
            <EmptyStageComponent
              heading={SaleEmptyStageData.heading}
              desc={SaleEmptyStageData.desc}
              subHeading={SaleEmptyStageData.subHeading}
              subItems={SaleEmptyStageData.subItems}
            />
          ) : (
            isSuccess && (
              <DataTable
                columns={SalesColumns}
                onRowClick={onRowClick}
                data={data}
              />
            )
          )}
        </Wrapper>
      )}

      {isCreatingSales && !isCreatingInvoice && !isOrderView && (
        <CreateOrder
          type="sales"
          name="Offer"
          cta="offer"
          onCancel={() => setIsCreatingSales(false)}
        />
      )}

      {isCreatingInvoice &&
        !isCreatingSales &&
        !isOrderView &
        (
          <CreateOrder
            name="Invoice"
            cta="offer"
            onCancel={() => setIsCreatingInvoice(false)}
          />
        )}

    </>
  );
};

export default SalesOrder;
