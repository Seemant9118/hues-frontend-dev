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
import { Plus } from "lucide-react";
import AddModal from "./Modals/AddModal";

const CreateOrder = ({ onCancel, onSubmit, name, cta, type = "sales" }) => {
  const [createdOrders, setCreatedOrders] = useState([]);
  const [order, setOrder] = useState({
    customer: "",
    type: "",
    item: "",
    price: "",
    quantity: "",
    gst: "",
    amount: "",
  });

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center gap-4 p-4 rounded-sm border-neutral-200 border">
        <Label>{cta == "offer" ? "Client" : "Vendor"}</Label>
        <Select
          value={order.customer}
          onValueChange={(value) =>
            setOrder((prev) => ({ ...prev, customer: value }))
          }
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="add-new"> */}
            {type === "sales" && (
              <AddModal
                className={"w-full border-none"}
                type={"Add"}
                cta="Add New"
                modalHead="Client"
                onSubmit={(newClient) => {}}
              />
            )}
            {type === "purchase" && (
              <AddModal
                className={"w-full border-none"}
                type={"Add"}
                cta="Add New"
                modalHead="Vendor"
                onSubmit={(newVendor) => {}}
              />
            )}
            {/* <span className="text-blue-500">+</span> Add New */}
            {/* </SelectItem> */}
            {cta == "offer" ? (
              <>
                <SelectItem value="Client 1">Client 1</SelectItem>
                <SelectItem value="Client 2">Client 2</SelectItem>
              </>
            ) : (
              <>
                <SelectItem value="Vendor 1">Vendor 1</SelectItem>
                <SelectItem value="Vendor 2">Vendor 2</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="p-4 rounded-sm border-neutral-200 border flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 ">
          <div className="flex items-center gap-4">
            <Label className="flex-shrink-0">Item</Label>
            <Select
              value={order.item}
              onValueChange={(value) =>
                setOrder((prev) => ({ ...prev, item: value }))
              }
            >
              <SelectTrigger className="max-w-xs gap-5">
                <SelectValue placeholder="Select" />
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
            <Label>Price:</Label>
            <Input
              value={order.price}
              onChange={(e) =>
                setOrder((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
              className="max-w-20"
            />
          </div>
          <div className="flex items-center gap-4">
            <Label>GST (%) :</Label>
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
            <Label>Amount:</Label>
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
            Add
          </Button>
        </div>
      </div>
      <DataTable data={createdOrders} columns={CreateSalesColumns} />
      <div className="h-[1px] bg-neutral-300 mt-auto"></div>

      <div className="flex justify-end items-center gap-4 ">
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>

        <SuccessModal
          onClose={() =>
            onSubmit(
              order,
              cta == "offer" ? (order.type = "Offer") : (order.type = "Bid")
            )
          }
        >
          <Button>Create</Button>
        </SuccessModal>
      </div>
    </Wrapper>
  );
};

export default CreateOrder;
