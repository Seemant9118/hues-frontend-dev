"use client";
import { goods_api } from "@/api/inventories/goods/goods";
import { services_api } from "@/api/inventories/services/services";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocalStorageService, cn } from "@/lib/utils";
import { CreateProductGoods } from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import { CreateProductServices } from "@/services/Inventories_Services/Services_Inventories/Services_Inventories";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { toast } from "sonner";
import DatePickers from "./DatePickers";
import InputWithLabel from "./InputWithLabel";
import { usePathname } from "next/navigation";

const AddItem = ({ name, onCancel, cta }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get("enterprise_Id");
  const user_id = LocalStorageService.get("user_profile");
  const pathname = usePathname();
  const isGoods = pathname.includes("goods");

  const [date, setDate] = useState(moment(new Date()).format("DD-MM-YYYY"));
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
    type: isGoods ? "goods" : "services",
    batch: "",
    expiry: date.toString(),
    weight: "",
    length: "",
    breadth: "",
    height: "",
    applications: "",
    units: "",
  });

  const mutationGoods = useMutation({
    mutationFn:
      item.type === "goods" ? CreateProductGoods : CreateProductServices,
    onSuccess: () => {
      toast.success("Product Goods Added Successfully");
      queryClient.invalidateQueries({
        queryKey: [goods_api.getAllProductGoods.endpointKey],
      });
      onCancel();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const mutationServices = useMutation({
    mutationFn:
      item.type === "goods" ? CreateProductGoods : CreateProductServices,
    onSuccess: () => {
      toast.success("Product Services Added Successfully");
      queryClient.invalidateQueries({
        queryKey: [services_api.getAllProductServices.endpointKey],
      });
      onCancel();
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
              name="Product Name"
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
              name="Quantity"
              id="quantity"
              required={true}
              // onChange={onChange}
              // value={item.amount}
            />
          </div>
          <InputWithLabel
            name="Amount"
            id="amount"
            required={true}
            onChange={onChange}
            value={item.amount}
          />
        </>
      ) : (
        // for services
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="Service Name"
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
              name="Quantity"
              id="quantity"
              required={true}
              // onChange={onChange}
              // value={item.amount}
            />
          </div>
          <InputWithLabel
            name="Amount"
            id="amount"
            required={true}
            onChange={onChange}
            value={item.amount}
          />
        </>
      )}

      {/* optional data fields */}
      <div className="grid grid-cols-2 gap-2.5">
        <InputWithLabel
          name="Batch"
          id="batch"
          // required={item.type == "goods"}
          onChange={onChange}
          value={item.batch}
        />
        {/* <InputWithLabel
          name="Expiry"
          id="expiry"
          required={item.type === "goods" || item.type === "services"}
          onChange={onChange}
          value={item.expiry}
        /> */}

        <div className="grid w-full items-center gap-1.5">
          <Label
            htmlFor="dob"
            className="text-[#414656] font-medium flex items-center gap-1"
          >
            Expiry
          </Label>

          <div className="relative flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <DatePickers
              selected={date}
              onChange={(date) => setDate(moment(date).format("DD-MM-YYYY"))}
            />
            <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        <InputWithLabel
          name="Weight (kg)"
          id="weight"
          // required={item.type == "goods"}
          onChange={onChange}
          value={item.weight}
        />
        <InputWithLabel
          name="Length (cm)"
          id="length"
          // required={item.type == "goods"}
          onChange={onChange}
          value={item.length}
        />
        <InputWithLabel
          name="Breadth (cm)"
          id="breadth"
          // required={item.type == "goods"}
          onChange={onChange}
          value={item.breadth}
        />
        <InputWithLabel
          name="Height (cm)"
          id="height"
          // required={item.type == "goods"}
          onChange={onChange}
          value={item.height}
        />
      </div>
      <InputWithLabel
        name="Application"
        id="applications"
        // required={item.type == "goods" || item.type === "services"}
        onChange={onChange}
        value={item.applications}
      />

      <div className="h-[1px] bg-neutral-300 mt-auto"></div>

      <div className="flex justify-end items-center gap-4 ">
        <Button
          onClick={() => {
            onCancel();
          }}
          variant={"outline"}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={cta === "Template"}>
          Add
        </Button>
      </div>
    </form>
  );
};

export default AddItem;
