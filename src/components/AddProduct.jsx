import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    const { id, value } = e.target;
    setProduct(values => ({ ...values, [id]: value }));
  };

  useEffect(() => {
    console.log(product)
  }, [product]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(product);
      }}
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-2 grow scrollBarStyles"
      )}
    >
      <h2 className="text-zinc-900 font-bold text-2xl">{name}</h2>
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
          name="Expiry"
          id="expiry"
          onChange={onChange}
          value={product.expiry}
        />
        <InputWithLabel
          name="Weight (cms)"
          id="weight"
          onChange={onChange}
          value={product.weight}
        />
        <InputWithLabel
          name="Length"
          id="length"
          onChange={onChange}
          value={product.length}
        />
        <InputWithLabel
          name="Bredth (cms)"
          id="bredth"
          onChange={onChange}
          value={product.bredth}
        />
        <InputWithLabel
          name="Height (cms)"
          id="height"
          onChange={onChange}
          value={product.height}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <InputWithLabel
          name="Components"
          id="components"
          onChange={onChange}
          value={product.components}
        />
        <InputWithLabel
          name="Application"
          id="application"
          onChange={onChange}
          value={product.application}
        />
        <InputWithLabel
          name="Rate"
          id="rate"
          onChange={onChange}
          value={product.rate}
        />
        <InputWithLabel
          name="Units"
          id="units"
          onChange={onChange}
          value={product.units}
        />
        <InputWithLabel
          name="HSN Code"
          id="hsn_code"
          onChange={onChange}
          value={product.hsn_code}
        />
        <InputWithLabel
          name="GST (%)"
          id="gst"
          onChange={onChange}
          value={product.gst}
        />
        <InputWithLabel
          name="GST Value"
          id="gst_value"
          onChange={onChange}
          value={product.gst_value}
        />
        <InputWithLabel
          name="Amount"
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
