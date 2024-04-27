"use client";
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
import { LocalStorageService } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateProductGoods } from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import { toast } from "sonner";
import { CreateProductServices } from "@/services/Inventories_Services/Services_Inventories/Services_Inventories";
import { goods_api } from "@/api/inventories/goods/goods";
import { services_api } from "@/api/inventories/services/services";

const AddItem = ({ name, onCancel, cta, setIsAdding }) => {

  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get("enterprise_Id");
  const user_id = LocalStorageService.get("user_profile");

  const [item, setItem] = useState({
    enterprise_id: enterpriseId,
    template_id: user_id,
    product_name: "",
    manufacturer_name: "",
    service_name: "",
    description: "",
    hsn_code: "",
    SAC: "",
    rate: "",
    gst_percentage: "",
    amount: "",
    type: "goods",
    batch: "",
    expiry: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    applications: "",
    units: "",
  });

  const mutationGoods = useMutation({
    mutationFn: item.type === "goods" ? CreateProductGoods : CreateProductServices,
    onSuccess: () => {
      toast.success("Product Goods Added Successfully");
      setItem({
        // mandatory data
        enterprise_id: enterpriseId,
        template_id: user_id,
        product_name: "",
        manufacturer_name: "",
        service_name: "",
        description: "",
        hsn_code: "",
        SAC: "",
        rate: "",
        gst_percentage: "",
        amount: "",
        type: "goods",
        // optional data
        batch: "",
        expiry: "",
        weight: "",
        length: "",
        breadth: "",
        height: "",
        applications: "",
        units: "",
      });
      queryClient.invalidateQueries({
        queryKey: [goods_api.getAllProductGoods.endpointKey],
      });
      setIsAdding((prev) => !prev);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const mutationServices = useMutation({
    mutationFn: item.type === "goods" ? CreateProductGoods : CreateProductServices,
    onSuccess: () => {
      toast.success("Product Services Added Successfully");
      setItem({
        // mandatory data
        enterprise_id: enterpriseId,
        template_id: user_id,
        product_name: "",
        manufacturer_name: "",
        service_name: "",
        description: "",
        hsn_code: "",
        SAC: "",
        rate: "",
        gst_percentage: "",
        amount: "",
        type: "services",
        // optional data
        batch: "",
        expiry: "",
        weight: "",
        length: "",
        breadth: "",
        height: "",
        applications: "",
        units: "",
      });
      queryClient.invalidateQueries({
        queryKey: [services_api.getAllProductServices.endpointKey],
      });
      setIsAdding((prev) => !prev);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const onChange = (e) => {
    const { id, value } = e.target;
    // validation input value
    if (
      id === "rate" ||
      id === "gst_percentage" ||
      id === "amount" ||
      id === "weight" ||
      id === "height" ||
      id === "length" ||
      id === "breadth"
    ) {
      if (!isNaN(value)) {
        setItem((values) => ({ ...values, [id]: value }));
      }
      return;
    }

    setItem((values) => ({ ...values, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (item.type === "goods") {
      // goodsdata
      const { service_name, SAC, type, units, ...goodsData } = item;
      // mutate goods
      mutationGoods.mutate(goodsData);
      return;
    }
    // servicesdata
    const {
      product_name,
      manufacturer_name,
      hsn_code,
      type,
      units,
      batch,
      weight,
      length,
      breadth,
      height,
      ...servicesData
    } = item;
    // mutate service
    mutationServices.mutate(servicesData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-4 h-full overflow-y-auto p-2 grow scrollBarStyles"
      )}
    >
      <h2 className="text-zinc-900 font-bold text-2xl">{name}</h2>

      <div className="grid grid-cols-2 gap-2.5">
        {cta === "Item" && (
          <div className="flex flex-col gap-4 ">
            <div>
              <Label className="flex-shrink-0">Type</Label>{" "}
              <span className="text-red-600">*</span>
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
                <SelectItem value="goods">Goods</SelectItem>
                <SelectItem value="services">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* mandatory data fields */}
      {item.type == "goods" ? (
        // for goods
        <>
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
              id="gst_percentage"
              required={true}
              onChange={onChange}
              value={item.gst_percentage}
            />
            <InputWithLabel
              name="Amount"
              id="amount"
              required={true}
              onChange={onChange}
              value={item.amount}
            />
          </div>
        </>
      ) : (
        // for services
        <>
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
              id="SAC"
              required={true}
              onChange={onChange}
              value={item.SAC}
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
              id="gst_percentage"
              required={true}
              onChange={onChange}
              value={item.gst_percentage}
            />
            <InputWithLabel
              name="Amount"
              id="amount"
              required={true}
              onChange={onChange}
              value={item.amount}
            />
          </div>
        </>
      )}

      {/* optional data fields */}
      <div className="grid grid-cols-2 gap-2.5">
        <InputWithLabel
          name="Batch"
          id="batch"
          required={item.type == "goods"}
          onChange={onChange}
          value={item.batch}
        />
        <InputWithLabel
          name="Expiry"
          id="expiry"
          required={item.type === "goods" || item.type === "services"}
          onChange={onChange}
          value={item.expiry}
        />
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        <InputWithLabel
          name="Weight (kg)"
          id="weight"
          required={item.type == "goods"}
          onChange={onChange}
          value={item.weight}
        />
        <InputWithLabel
          name="Length (cm)"
          id="length"
          required={item.type == "goods"}
          onChange={onChange}
          value={item.length}
        />
        <InputWithLabel
          name="Breadth (cm)"
          id="breadth"
          required={item.type == "goods"}
          onChange={onChange}
          value={item.breadth}
        />
        <InputWithLabel
          name="Height (cm)"
          id="height"
          required={item.type == "goods"}
          onChange={onChange}
          value={item.height}
        />
      </div>
      <InputWithLabel
        name="Application"
        id="applications"
        required={item.type == "goods" || item.type === "services"}
        onChange={onChange}
        value={item.applications}
      />

      <div className="h-[1px] bg-neutral-300 mt-auto"></div>

      <div className="flex justify-end items-center gap-4 ">
        <Button
          onClick={() => {
            setIsAdding((prev) => !prev);
            setItem(null);
          }}
          variant={"outline"}
        >
          Cancel
        </Button>
        <Button type="submit">Add</Button>
      </div>
    </form>
  );
};

export default AddItem;
