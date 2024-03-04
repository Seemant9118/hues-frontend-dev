"use client";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { FolderUp, PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { SalesColumns } from "./SalesColumns";

const SalesOrder = () => {
  const [orders, setOrders] = useState([
    {
      date: "12/02/2024",
      items: "Starbucks",
      orders: "Starbucks Cold Brew Product",
      customers: "Cody",
      price: "40",
      gst: "5",
      amount: "2500",
      status: "Paid",
    },
  ]);

  return (
    <Wrapper>
      <SubHeader name={"Sales Orders"}>
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
            Create Sales
          </Button>
          <Button
            // onClick={() => setIsAdding(true)}
            variant={"blue_outline"}
            size="sm"
          >
            <PlusCircle size={14} />
            Create Invoice
          </Button>
        </div>
      </SubHeader>
      <DataTable columns={SalesColumns} data={orders} />
    </Wrapper>
  );
};

export default SalesOrder;
