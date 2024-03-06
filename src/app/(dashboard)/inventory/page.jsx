"use client";
import AddProduct from "@/components/AddProduct";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { Columns } from "@/components/columns";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Layers2, Upload } from "lucide-react";
import React, { useState } from "react";

const InventoryPage = () => {
  const [products, setProducts] = useState([
    {
      name: "Brand: Crocin",
      code: "#HUESGT45",
      description:
        "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration.",
      category: "Business Planning",
      quantity: "44",
    },
  ]);
  const [isAdding, setIsAdding] = useState(false);

  return (
    <>
      {!isAdding && (
        <Wrapper>
          <SubHeader name={"Inventory"}>
            <div className="flex items-center justify-center gap-4">
              <Button variant={"blue_outline"} size="sm">
                <Upload size={14} />
                Upload List
              </Button>
              <Button
                onClick={() => setIsAdding(true)}
                variant={"blue_outline"}
                size="sm"
              >
                <Layers2 size={14} />
                Add Product
              </Button>
            </div>
          </SubHeader>
          <DataTable columns={Columns} data={products} />
        </Wrapper>
      )}
      {isAdding && (
        <AddProduct
          onCancel={() => setIsAdding(false)}
          onSubmit={(newProduct) => {
            setIsAdding(false);
          }}
          name={"Add Product"}
          cta={"Product"}
        />
      )}
    </>
  );
};

export default InventoryPage;
