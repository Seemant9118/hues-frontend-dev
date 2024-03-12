"use client";
import React, { useState } from "react";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { FolderUp, PlusCircle } from "lucide-react";
import { PurchaseColumns } from "./PurchaseColumns";
import CreateSales from "@/components/CreateSales";

const PurchaseOrders = () => {
  const [purchases, setPurchases] = useState([
    {
      date: "12/02/2024",
      item: "Starbucks",
      type: "recieved",
      orders: "Starbucks Cold Brew Product",
      vendors: "R&T Pharma Private. Limited.",
      delivery_date: "02/05/12",
      amount: "2500",
      status: "Paid",
    },
  ]);

  const [isCreatingPurchase, setIsCreatingPurchase] = useState(false);

  return (
    <>
      {!isCreatingPurchase && (
        <Wrapper>
          <SubHeader name={"Purchase Orders"}>
            <div className="flex items-center justify-center gap-4">
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
                Create Purchase
              </Button>
            </div>
          </SubHeader>
          <DataTable columns={PurchaseColumns} data={purchases} />
        </Wrapper>
      )}
      {isCreatingPurchase && (
        <CreateSales
          name="Create Purchase"
          onCancel={() => setIsCreatingPurchase(false)}
        />
      )}
    </>
  );
};

export default PurchaseOrders;
