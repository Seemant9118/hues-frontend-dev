"use client";
import React, { useState } from "react";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { FolderUp, PlusCircle } from "lucide-react";
import { PurchaseColumns } from "./PurchaseColumns";

const PurchaseOrders = () => {
  const [purchases, setPurchases] = useState([
    {
      date: "12/02/2024",
      item: "Starbucks",
      orders: "Starbucks Cold Brew Product",
      vendors: "R&T Pharma Private. Limited.",
      delivery_date: "02/05/12",
      amount: "2500",
      status: "Paid",
    },
  ]);

  return (
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
          <Button variant={"blue_outline"} size="sm">
            <PlusCircle size={14} />
            Create Purchase
          </Button>
        </div>
      </SubHeader>
      <DataTable columns={PurchaseColumns} data={purchases} />
    </Wrapper>
  );
};

export default PurchaseOrders;
