import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import InputWithLabel from "./InputWithLabel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Label } from "@/components/ui/label";

const AddItem = ({ name, onSubmit, onCancel, cta }) => {

  const [item, setItem] = useState({
    // mandatory data
    product_name: "",
    manufacturer_name: "",
    service_name: "",
    description: "",
    hsn_code: "",
    sac: "",
    rate: "",
    gst: "",
    amount: "",
    type: "Goods",
    // optional data
    batch: "",
    expiry: "",
    weight: "",
    length: "",
    bredth: "",
    height: "",
    application: "",
    units: "",
    gst_value: "",
  });


  const onChange = (e) => {
    const { id, value } = e.target;
    setItem(values => ({ ...values, [id]: value }));
  };

  // useEffect(() => {
  //   console.log(item)
  // }, [item]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(item);
      }}
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-2 grow scrollBarStyles"
      )}
    >
      <h2 className="text-zinc-900 font-bold text-2xl">{name}</h2>

      <div className="grid grid-cols-2 gap-2.5">
        {
          cta === "Item" && (
            <div className="flex flex-col gap-4 ">
              <div>
                <Label className="flex-shrink-0">Select Item Type</Label> <span className="text-red-600">*</span>
              </div>

              <Select
                required
                value={item.type}
                onValueChange={(value) =>
                  setItem((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="max-w-xs gap-5">
                  <SelectValue placeholder="Select Item Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Goods">Goods</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )
        }

      </div>

      {/* mandatory data fields */}
      {
        item.type == "Goods" || item.type == "" ?
          // for goods
          (<>
            <div className="grid grid-cols-2 gap-2.5">
              <InputWithLabel
                name="Product Name (Brand)"
                id="product_name"
                required={true}
                onChange={onChange}
                value={item.product_name}
              /> 
              <InputWithLabel
                name="Manufacturer's Name"
                id="manufacturer_name"
                required={true}
                onChange={onChange}
                value={item.manufacturer_name}
              />
            </div>
            <InputWithLabel
              name="Description"
              id="description"
              required={true}
              onChange={onChange}
              value={item.description}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <InputWithLabel
                name="HSN Code"
                id="hsn_code"
                required={true}
                onChange={onChange}
                value={item.hsn_code}
              />
              <InputWithLabel
                name="Rate"
                id="rate"
                required={true}
                onChange={onChange}
                value={item.rate}
              />
              <InputWithLabel
                name="GST (%)"
                id="gst"
                required={true}
                onChange={onChange}
                value={item.gst}
              />
              <InputWithLabel
                name="Amount"
                id="amount"
                required={true}
                onChange={onChange}
                value={item.amount}
              />
            </div>
          </>)
          :
          // for services
          (<>
            <div className="grid grid-cols-2 gap-2.5">
              <InputWithLabel
                name="Service Name (Brand)"
                id="service_name"
                required={true}
                onChange={onChange}
                value={item.service_name}
              />
            </div>
            <InputWithLabel
              name="Description"
              id="description"
              required={true}
              onChange={onChange}
              value={item.description}
            />
            <div className="grid grid-cols-2 gap-2.5">
              <InputWithLabel
                name="SAC"
                id="sac"
                required={true}
                onChange={onChange}
                value={item.sac}
              />
              <InputWithLabel
                name="Rate"
                id="rate"
                required={true}
                onChange={onChange}
                value={item.rate}
              />
              <InputWithLabel
                name="GST (%)"
                id="gst"
                required={true}
                onChange={onChange}
                value={item.gst}
              />
              <InputWithLabel
                name="Amount"
                id="amount"
                required={true}
                onChange={onChange}
                value={item.amount}
              />
            </div>
          </>)
      }

      {/* optional data fields */}
      <div className="grid grid-cols-2 gap-2.5">
        <InputWithLabel
          name="Batch"
          id="batch"
          onChange={onChange}
          value={item.batch}
        />
        <InputWithLabel
          name="Expiry"
          id="expiry"
          onChange={onChange}
          value={item.expiry}
        />
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        <InputWithLabel
          name="Weight (kg)"
          id="weight"
          onChange={onChange}
          value={item.weight}
        />
        <InputWithLabel
          name="Length (cm)"
          id="length"
          onChange={onChange}
          value={item.length}
        />
        <InputWithLabel
          name="Bredth (cm)"
          id="bredth"
          onChange={onChange}
          value={item.bredth}
        />
        <InputWithLabel
          name="Height (cm)"
          id="height"
          onChange={onChange}
          value={item.height}
        />
      </div>
      <InputWithLabel
        name="Application"
        id="application"
        onChange={onChange}
        value={item.application}
      />

      <div className="h-[1px] bg-neutral-300 mt-6"></div>

      <div className="flex justify-end items-center gap-4 py-5 mt-auto">
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(item)}>Add {cta}</Button>
      </div>
    </form>
  );
};

export default AddItem;
