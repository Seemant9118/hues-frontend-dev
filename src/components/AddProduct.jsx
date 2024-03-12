import React, { useState } from "react";
import Wrapper from "@/components/Wrapper";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import InputWithLabel from "./InputWithLabel";

const AddProduct = ({ name, onSubmit, onCancel, cta }) => {
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

  const onChange = (e) => {
    let { name, value } = e.target;

    setProduct(values => ({ ...values, [name]: value }));
    console.log(product)
  };

  return (
    <form
      onSubmit={() => onSubmit(product)}
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-2 grow scrollBarStyles"
      )}
    >
      <h2 className="text-zinc-900 font-bold text-2xl">{name}</h2>
      <div className="grid grid-cols-2 gap-2.5">
        <InputWithLabel
          name="product_name"
          id="product_name"
          onChange={onChange}
          value={product.product_name}
        />
        <InputWithLabel
          name="company_name"
          id="company_name"
          onChange={onChange}
          value={product.company_name}
        />
      </div>
      <InputWithLabel
        name="description"
        id="description"
        onChange={onChange}
        value={product.description}
      />
      <div className="grid grid-cols-3 gap-2.5">
        <InputWithLabel
          name="batch"
          id="batch"
          onChange={onChange}
          value={product.batch}
        />
        <InputWithLabel
          name="expiry"
          id="expiry"
          onChange={onChange}
          value={product.expiry}
        />
        <InputWithLabel
          name="weight"
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
          name="bredth"
          id="bredth"
          onChange={onChange}
          value={product.bredth}
        />
        <InputWithLabel
          name="height"
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
          name="hsn_code"
          id="hsn_code"
          onChange={onChange}
          value={product.hsn_code}
        />
        <InputWithLabel
          name="gst"
          id="gst"
          onChange={onChange}
          value={product.gst}
        />
        <InputWithLabel
          name="gst_value"
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

      <div className="flex justify-end items-center gap-4 py-5 mt-auto">
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(product)}>Add {cta}</Button>
      </div>
    </form>
  );
};

export default AddProduct;
