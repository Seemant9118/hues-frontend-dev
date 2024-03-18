"use client";
import React, { useState } from "react";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { FolderUp, PlusCircle } from "lucide-react";
import { PurchaseColumns } from "./PurchaseColumns";
import EmptyStageComponent from "@/components/EmptyStageComponent";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateOrder from "@/components/CreateOrder";

const PurchaseOrders = () => {
  const [purchases, setPurchases] = useState([]);


  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);
  const [istype, setIsType] = useState("All");

  const PurchaseEmptyStageData = {
    heading: `Simplify purchasing: from bids to invoices with digital negotiations and signatures, ensuring
    transparency and ease.`,
    subHeading: "Features",
    subItems: [
      { id: 1, subItemtitle: `Engage vendors with bids or receive offers on a unified platform.` },
      { id: 2, subItemtitle: `Securely negotiate and finalize purchases with digital signatures.` },
      { id: 3, subItemtitle: `Generate and organize invoices automatically or manually for precise tracking` },
      { id: 4, subItemtitle: `Streamline internal and external financial processes with easy payment advice.` },
    ],
  };

  return (
    <>
      {!isCreatingPurchase && (
        <Wrapper>
          <SubHeader name={"Purchase Orders"}>
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
                    <SelectItem value="Bid">Bid</SelectItem>
                    <SelectItem value="offer">offer</SelectItem>
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
                onClick={() => setIsCreatingPurchase(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <PlusCircle size={14} />
                Create Bid
              </Button>
            </div>
          </SubHeader>
          {purchases.length === 0 ? (
            <EmptyStageComponent
              heading={PurchaseEmptyStageData.heading}
              desc={PurchaseEmptyStageData.desc}
              subHeading={PurchaseEmptyStageData.subHeading}
              subItems={PurchaseEmptyStageData.subItems}
            />
          ) : (
            <DataTable
              columns={PurchaseColumns}
              data={purchases.filter((purchase) => {
                if (istype === "All" || istype === "") return true;
                return purchase.type === istype;
              })}
            />
          )}
        </Wrapper>
      )}
      {isCreatingPurchase && (
        <CreateOrder
          name="Create Bid"
          onCancel={() => setIsCreatingPurchase(false)}
          onSubmit={(newOrder) => {
            setPurchases((prev) => [...prev, newOrder]);
            setIsCreatingPurchase(false);
          }}
        />
      )}
    </>
  );
};

export default PurchaseOrders;
