"use client";

import React from "react";
import Wrapper from "@/components/Wrapper";
import SubHeader from "@/components/Sub-header";
import { OrderColumns } from "./OrderColumns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";

const ViewOrder = () => {
  const items = [
    {
      item: "Crocin ",
      quantity: "2",
      price: "30",
      status: "New",
    },
    {
      item: "Crocin ",
      quantity: "2",
      price: "30",
      status: "Accepted",
    },
    {
      item: "Crocin ",
      quantity: "2",
      price: "30",
      status: "Negotiation",
    },
  ];
  return (
    <Wrapper className="relative">
      <SubHeader name={"ORDER ID: #" + 4444}></SubHeader>
      <DataTable columns={OrderColumns} data={items}></DataTable>

      <div className="absolute bottom-0 right-0">
        <div className="flex justify-end">
          <Button variant="grey" className="w-32" onClick={() => {}}>
            {" "}
            Close{" "}
          </Button>
        </div>
      </div>
    </Wrapper>
  );
};

export default ViewOrder;
