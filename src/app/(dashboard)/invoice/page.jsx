"use client";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { Columns } from "@/components/columns/columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Layers2 } from "lucide-react";
import CreateOrder from "@/components/orders/CreateOrder";

export default function Invoice() {
  const [products, setProducts] = useState([
    {
      type: "Type",
      product_name: "Brand: Crocin",
      hsn_code: "#HUESGT45",
      description:
        "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.",
      category: "Business Planning",
      rate: "44",
      gst: "HFSK6468T",
      amount: "23899",
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      {/* Main Table listing page */}
      {!isAdding && (
        <Wrapper>
          <SubHeader name={"Invoice"}>
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setIsAdding(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Layers2 size={14} />
                Generate Invoice
              </Button>
            </div>
          </SubHeader>
          <DataTable columns={Columns} data={products} />
        </Wrapper>
      )}
      {/* Generate Modal Handling */}
      {isAdding && (
        <CreateOrder
          onSubmit={() => {}}
          name="Create Invoice"
          onCancel={() => setIsAdding(false)}
        />
      )}
    </>
  );
}
