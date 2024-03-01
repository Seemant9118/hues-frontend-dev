"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PackageOpen, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState(null);
  const [product, setProduct] = useState({
    product_name: "",
    company_name: "",
    description: "",
    batch: "",
    expiry: "",
    weight: "",
    length: "",
    bredth: "",
    height: "",
    components: "",
    application: "",
    rate: "",
    units: "",
    hsn_code: "",
    gst: "",
    gst_value: "",
    amount: "",
  });

  const onChange = () => {};

  return (
    <>
      {!file ? (
        <div className="flex flex-col justify-center items-center gap-2 h-full">
          <PackageOpen className="text-neutral-500" />
          <p className="text-neutral-500">
            No Product Uploaded Yet. Click on buttons below.
          </p>
          <Button
            asChild
            variant={"secondary"}
            className="gap-2 text-blue-500 border border-blue-500 hover:bg-blue-500/10 cursor-pointer"
          >
            <label htmlFor="template">
              <Upload />
              Add Template
            </label>
          </Button>
          <input
            onChange={(e) => {
              setFile(true);
            }}
            id="template"
            type="file"
            className="sr-only"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2 h-full overflow-y-auto">
          <h2 className="text-zinc-900 font-bold text-2xl">Product Template</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="Product Name"
              id="product_name"
              onChange={onChange}
              value={product.product_name}
            />
            <InputWithLabel
              name="Company Name"
              id="company_name"
              onChange={onChange}
              value={product.company_name}
            />
          </div>
          <InputWithLabel
            name="Description"
            id="description"
            onChange={onChange}
            value={product.description}
          />
          <div className="grid grid-cols-3 gap-2.5">
            <InputWithLabel
              name="Batch"
              id="batch"
              onChange={onChange}
              value={product.batch}
            />
            <InputWithLabel
              name="batch"
              id="weight"
              onChange={onChange}
              value={product.weight}
            />
            <InputWithLabel
              name="weight (gms)"
              id="weight"
              onChange={onChange}
              value={product.weight}
            />
            <InputWithLabel
              name="length"
              id="length"
              onChange={onChange}
              value={product.length}
            />
            <InputWithLabel
              name="bredth (cms)"
              id="bredth"
              onChange={onChange}
              value={product.bredth}
            />
            <InputWithLabel
              name="height (cms)"
              id="height"
              onChange={onChange}
              value={product.height}
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="components"
              id="components"
              onChange={onChange}
              value={product.components}
            />
            <InputWithLabel
              name="application"
              id="application"
              onChange={onChange}
              value={product.application}
            />
            <InputWithLabel
              name="rate"
              id="rate"
              onChange={onChange}
              value={product.rate}
            />
            <InputWithLabel
              name="units"
              id="units"
              onChange={onChange}
              value={product.units}
            />
            <InputWithLabel
              name="hsn code"
              id="hsn_code"
              onChange={onChange}
              value={product.hsn_code}
            />
            <InputWithLabel
              name="gst (%)"
              id="gst"
              onChange={onChange}
              value={product.gst}
            />
            <InputWithLabel
              name="gst value"
              id="gst_value"
              onChange={onChange}
              value={product.gst_value}
            />
            <InputWithLabel
              name="amount"
              id="amount"
              onChange={onChange}
              value={product.amount}
            />
          </div>
          <div className="h-[1px] bg-neutral-300 mt-6"></div>

          <div className="flex justify-end items-center gap-4 py-5">
            <Button variant={"outline"}>Cancel</Button>
            <Button>Add Template</Button>
          </div>
        </div>
      )}
    </>
  );
}

const InputWithLabel = ({ name, id, onChange, value }) => {
  return (
    <div className="flex flex-col gap-2">
      <Label className="capitalize" htmlFor={id}>
        {name}
      </Label>
      <Input className="rounded" value={value} onChange={onChange} id={id} />
    </div>
  );
};
