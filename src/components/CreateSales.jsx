import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CreateSalesColumns } from "@/components/columns/CreateSalesColumns";
import { DataTable } from "@/components/table/data-table";
import Wrapper from "./Wrapper";
import SubHeader from "./Sub-header";
import { Button } from "./ui/button";
import SuccessModal from "./Modals/SuccessModal";

const CreateSales = ({ onCancel, setIsCreatingSales, onSubmit, name }) => {
  const [createdOrders, setCreatedOrders] = useState([]);
  const [order, setOrder] = useState({
    customer: "",
    item: "",
    unit_price: "",
    quantity: "",
    gst: "",
    amount: "",
    type: "",
  });

  console.log(order);

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center gap-4 p-4 rounded-sm border-neutral-200 border">
        <Label>Select Customer</Label>
        <Select
          value={order.customer}
          onValueChange={(value) =>
            setOrder((prev) => ({ ...prev, customer: value }))
          }
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Customer 1">Customer 1</SelectItem>
            <SelectItem value="Customer 2">Customer 2</SelectItem>
          </SelectContent>
        </Select>

        <Label>Select Type</Label>
        <Select
          value={order.type}
          onValueChange={(value) =>
            setOrder((prev) => ({ ...prev, type: value }))
          }
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Bid">Bid</SelectItem>
            <SelectItem value="offer">offer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="p-4 rounded-sm border-neutral-200 border flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 ">
          <div className="flex items-center gap-4">
            <Label className="flex-shrink-0">Select Item</Label>
            <Select
              value={order.item}
              onValueChange={(value) =>
                setOrder((prev) => ({ ...prev, item: value }))
              }
            >
              <SelectTrigger className="max-w-xs gap-5">
                <SelectValue placeholder="Select Item" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Item 1">Item 1</SelectItem>
                <SelectItem value="Item 2">Item 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label>Quantity:</Label>
            <Input
              value={order.quantity}
              onChange={(e) =>
                setOrder((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }))
              }
              className="max-w-20"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label>Unit Price:</Label>
            <Input
              value={order.unit_price}
              onChange={(e) =>
                setOrder((prev) => ({
                  ...prev,
                  unit_price: e.target.value,
                }))
              }
              className="max-w-20"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label>GST:</Label>
            <Input
              value={order.gst}
              onChange={(e) =>
                setOrder((prev) => ({
                  ...prev,
                  gst: e.target.value,
                }))
              }
              className="max-w-20"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label>Total Amount:</Label>
            <Input
              value={order.amount}
              onChange={(e) =>
                setOrder((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              className="max-w-20"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={() => setCreatedOrders((prev) => [...prev, order])}
            variant="blue_outline"
          >
            Add Item
          </Button>
        </div>
      </div>
      <DataTable data={createdOrders} columns={CreateSalesColumns} />
      <div className="h-[1px] bg-neutral-300 mt-auto"></div>

      <div className="flex justify-end items-center gap-4 ">
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>
        <SuccessModal name="order">
          <Button onClick={(e) => {
            onSubmit(order);
            onCancel(setIsCreatingSales(true));
          }}>{name}</Button>
        </SuccessModal>
      </div>
    </Wrapper>
  );
};

export default CreateSales;
