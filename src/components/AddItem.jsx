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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DatePickers from "./DatePickers";
import InputWithLabel from "./InputWithLabel";
import { usePathname } from "next/navigation";
import ErrorBox from "./ErrorBox";
import EmptyStageComponent from "./EmptyStageComponent";

const AddItem = ({ name, onCancel, cta }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get("enterprise_Id");
  const user_id = LocalStorageService.get("user_profile");
  const pathname = usePathname();
  const isGoods = pathname.includes("goods");
  console.log(isGoods);

  const [errorMsg, setErrorMsg] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
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
    quantity: "",
    amount: "",
    type: isGoods ? "goods" : "services",
    batch: "",
    expiry: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    applications: "",
    units: "",
  });

  // set date into expiry field of item
  useEffect(() => {
    setItem((prevUserData) => ({
      ...prevUserData,
      expiry: selectedDate ? moment(selectedDate).format("DD/MM/YYYY") : "", // Update dynamically
    }));
  }, [selectedDate]);

  // clear errorMsg if item type changes
  useEffect(() => {
    setErrorMsg({});
    setItem({
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
      quantity: "",
      amount: "",
      type: item.type,
      batch: "",
      expiry: "",
      weight: "",
      length: "",
      breadth: "",
      height: "",
      applications: "",
      units: "",
    });
  }, [item.type]);

  const validation = (item) => {
    let error = {};

    // productName
    if (item.product_name === "") {
      error.product_name = "*Required Product Name";
    }
    // manufacturerName
    if (item.manufacturer_name === "") {
      error.manufacturer_name = "*Required Manufacturer Name";
    }
    //  serviceName
    if (item.service_name === "") {
      error.service_name = "*Required Service Name";
    }
    // description
    if (item.description === "") {
      error.description = "*Required Description";
    }
    // HSN
    if (item.hsn_code === "") {
      error.hsn_code = "*Required HSN Code";
    }
    // SAC
    if (item.SAC === "") {
      error.SAC = "*Required SAC";
    }
    // rate
    if (item.rate === "") {
      error.rate = "*Required Rate";
    }
    // gst_percentage
    if (item.gst_percentage === "") {
      error.gst_percentage = "*Required GST (%)";
    }
    // quantity
    if (item.quantity === "") {
      error.quantity = "*Required Quantity";
    }
    // amount
    if (item.amount === "") {
      error.amount = "*Required Amount";
    }
    return error;
  };

  const mutationGoods = useMutation({
    mutationFn: CreateProductGoods,
    onSuccess: () => {
      toast.success("Product Goods Added Successfully");
      queryClient.invalidateQueries({
        queryKey: [goods_api.getAllProductGoods.endpointKey],
      });
      onCancel();
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong!");
    },
  });

  const mutationServices = useMutation({
    mutationFn: CreateProductServices,
    onSuccess: () => {
      toast.success("Product Services Added Successfully");
      queryClient.invalidateQueries({
        queryKey: [services_api.getAllProductServices.endpointKey],
      });
      onCancel();
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const onChange = (e) => {
    const { id, value } = e.target;

    // validation input value
    if (
      id === "quantity" ||
      id === "rate" ||
      id === "gst_percentage" ||
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

  const handleSubmitGoods = (e) => {
    e.preventDefault();

    // Extract goods data
    const { service_name, SAC, type, units, ...goodsData } = item;
    let isError = validation(goodsData);

    // If no validation errors, mutate goods
    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      mutationGoods.mutate(goodsData);
      return;
    }
    setErrorMsg(isError);
  };
  const handleSubmitServices = (e) => {
    e.preventDefault();
    // Extract services data
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
      quantity,
      ...servicesData
    } = item;
    let isError = validation(servicesData);

    // If no validation errors, mutate service
    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      mutationServices.mutate(servicesData);
      return;
    }
    setErrorMsg(isError);
  };

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Item" />
        <Button variant="outline" onClick={onCancel}>Close</Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={
        item.type === "goods" ? handleSubmitGoods : handleSubmitServices
      }
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
            <div className="flex flex-col">
              <InputWithLabel
                name="Product Name"
                id="product_name"
                required={true}
                onChange={onChange}
                value={item.product_name}
              />
              {errorMsg?.product_name && (
                <ErrorBox msg={errorMsg.product_name} />
              )}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Manufacturer's Name"
                id="manufacturer_name"
                required={true}
                onChange={onChange}
                value={item.manufacturer_name}
              />
              {errorMsg?.manufacturer_name && (
                <ErrorBox msg={errorMsg.manufacturer_name} />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Description"
              id="description"
              required={true}
              onChange={onChange}
              value={item.description}
            />
            {errorMsg?.description && <ErrorBox msg={errorMsg.description} />}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="HSN Code"
                id="hsn_code"
                required={true}
                onChange={onChange}
                value={item.hsn_code}
              />
              {errorMsg?.hsn_code && <ErrorBox msg={errorMsg.hsn_code} />}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Rate"
                id="rate"
                required={true}
                onChange={onChange}
                value={item.rate}
              />
              {errorMsg?.rate && <ErrorBox msg={errorMsg.rate} />}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="GST (%)"
                id="gst_percentage"
                required={true}
                onChange={onChange}
                value={item.gst_percentage}
              />
              {errorMsg?.gst_percentage && (
                <ErrorBox msg={errorMsg.gst_percentage} />
              )}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Quantity"
                id="quantity"
                required={true}
                onChange={onChange}
                value={item.quantity}
              />
              {errorMsg?.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Amount"
              id="amount"
              required={true}
              onChange={onChange}
              value={item.amount}
            />
            {errorMsg?.amount && <ErrorBox msg={errorMsg.amount} />}
          </div>

          {/* optional data fields */}
          <div className="grid grid-cols-2 gap-2.5">
            <InputWithLabel
              name="Batch"
              id="batch"
              onChange={onChange}
              value={item.batch}
            />
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="expiry"
                className="text-[#414656] font-medium flex items-center gap-1"
              >
                Expiry
              </Label>
              <div className="relative flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top"
                />
                <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
              </div>
            </div>
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
              name="Breadth (cm)"
              id="breadth"
              onChange={onChange}
              value={item.breadth}
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
            id="applications"
            onChange={onChange}
            value={item.applications}
          />
        </>
      ) : (
        // for services
        <>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="Service Name"
                id="service_name"
                required={true}
                onChange={onChange}
                value={item.service_name}
              />
              {errorMsg?.service_name && (
                <ErrorBox msg={errorMsg.service_name} />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Description"
              id="description"
              required={true}
              onChange={onChange}
              value={item.description}
            />
            {errorMsg?.description && <ErrorBox msg={errorMsg.description} />}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="SAC"
                id="SAC"
                required={true}
                onChange={onChange}
                value={item.SAC}
              />
              {errorMsg?.SAC && <ErrorBox msg={errorMsg.SAC} />}
            </div>
            <div className="flex flex-col">
              <InputWithLabel
                name="Rate"
                id="rate"
                required={true}
                onChange={onChange}
                value={item.rate}
              />
              {errorMsg?.rate && <ErrorBox msg={errorMsg.rate} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col">
              <InputWithLabel
                name="GST (%)"
                id="gst_percentage"
                required={true}
                onChange={onChange}
                value={item.gst_percentage}
              />
              {errorMsg?.gst_percentage && (
                <ErrorBox msg={errorMsg.gst_percentage} />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="expiry"
                className="text-[#414656] font-medium flex items-center gap-1"
              >
                Expiry
              </Label>

              <div className="relative flex h-10 w-full rounded border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <DatePickers
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="dd/MM/yyyy"
                  popperPlacement="top"
                />
                <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <InputWithLabel
              name="Amount"
              id="amount"
              required={true}
              onChange={onChange}
              value={item.amount}
            />
            {errorMsg?.amount && <ErrorBox msg={errorMsg.amount} />}
          </div>
          <InputWithLabel
            name="Application"
            id="applications"
            // required={item.type == "goods" || item.type === "services"}
            onChange={onChange}
            value={item.applications}
          />
        </>
      )}

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
