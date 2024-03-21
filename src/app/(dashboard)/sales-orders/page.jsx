"use client";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { CloudFog, FolderUp, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { SalesColumns } from "./SalesColumns";
import CreateOrder from "@/components/CreateOrder";
import EmptyStageComponent from "@/components/EmptyStageComponent";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SalesOrder = () => {
  const [orders, setOrders] = useState([]);
  const [istype, setIsType] = useState("All");
  const [isCreatingSales, setIsCreatingSales] = useState(false);

  const SaleEmptyStageData = {
    heading: `~"Seamlessly manage sales, from bids to digital negotiations and secure invoicing with digital
    signatures."`,
    subHeading: "Features",
    subItems: [
      { id: 1, subItemtitle: `Initiate sales and deals by placing bids or making offers.` },
      { id: 2, subItemtitle: `Maximize impact by making or receiving offers on your catalogue.` },
      { id: 3, subItemtitle: `Securely negotiate with digitally signed counter-offers and bids.` },
      { id: 4, subItemtitle: `Finalize deals with mutual digital signatures for binding commitment.` },
      { id: 5, subItemtitle: `Effortlessly create and share detailed invoices, completing sales professionally. ` },
    ],
  };

  return (
    <>
      {!isCreatingSales && (
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
            </div>
          </SubHeader>
          {orders.length === 0 ? (
            <EmptyStageComponent
              heading={SaleEmptyStageData.heading}
              desc={SaleEmptyStageData.desc}
              subHeading={SaleEmptyStageData.subHeading}
              subItems={SaleEmptyStageData.subItems}
            />
          ) : (
            <DataTable
              columns={SalesColumns}
              data={orders.filter((order) => {
                if (istype === "All" || istype === "") return true;
                return order.type === istype;
              })}
            />
          )}
        </Wrapper>
      )}
      {isCreatingSales && (
        <CreateOrder
          name="Create"
          cta="offer"
          onSubmit={(newOrder) => {
            setOrders((prev) => [...prev, newOrder]);
            setIsCreatingSales(false);
          }}
          onCancel={() => setIsCreatingSales(false)}
        />
      )}
    </>
  );
};

export default SalesOrder;
