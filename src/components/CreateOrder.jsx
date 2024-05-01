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
import { CloudFog, Plus } from "lucide-react";
import AddModal from "./Modals/AddModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import { GetEnterpriseUsers } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { LocalStorageService } from "@/lib/utils";
import { goods_api } from "@/api/inventories/goods/goods";
import { GetAllProductGoods } from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";

const CreateOrder = ({ onCancel, onSubmit, name, cta, type }) => {
  const enterpriseId = LocalStorageService.get("enterprise_Id");

  // client/vendor fetching
  const { data: customerData } = useQuery({
    queryKey: [enterprise_user.getEnterpriseUsers.endpointKey],
    queryFn: GetEnterpriseUsers({
      user_type: "client",
      enterprise_id: enterpriseId,
    }),
    select: (customerData) => customerData.data.data,
  });
  let formattedData = [];
  if (customerData) {
    formattedData = customerData.flatMap((user) => ({
      ...user.mappedUserEnterprise,
      userId: user.id,
    }));
  }

  // // goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [goods_api.getAllProductGoods.endpointKey],
    queryFn: GetAllProductGoods,
    select: (goodsData) => goodsData.data.data,
  });

  const [createdOrders, setCreatedOrders] = useState([]);
  // const [order, setOrder] = useState({
  //   customer: "",
  //   type: "",
  //   item: "",
  //   price: "",
  //   quantity: "",
  //   gst: "",
  //   amount: "",
  // });

  const [order, setOrder] = useState({
    seller_enterprise_id: enterpriseId,
    buyer_enterperise_id: null,
    gst_amount: 2124,
    amount: 13924, // total amount + gst amount
    order_type: "PURCHASE",
    order_items: [
      {
        product_type: "GOODS",
        product_id: 2,
        quantity: 2,
        unit_price: 5900,
        gst_per_unit: 1062,
        total_amount: 13924, /// total amount + gst amount
        total_gst_amount: 2124,
      },
    ],
  });

  const handleChangeOrder = (e) => {
    let { name, value } = e.target;
    console.log(order);
    setOrder((values) => ({ ...values, [name]: value }));
  };

  //   {
  //     "seller_enterprise_id": 1,
  //     "buyer_enterperise_id": 1,
  //     "gst_amount": 2124,
  //     "amount": 13924, // total amount + gst amount
  //     "order_type": "PURCHASE",
  //     "order_items": [
  //         {
  //             "product_type": "GOODS",
  //             "product_id": 2,
  //             "quantity": 2,
  //             "unit_price": 5900,
  //             "gst_per_unit": 1062,
  //             "total_amount": 13924, /// total amount + gst amount
  //             "total_gst_amount": 2124
  //         }
  //     ]
  // }

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center gap-4 p-4 rounded-sm border-neutral-200 border">
        <Label>{cta == "offer" ? "Client" : "Vendor"}</Label>
        <Select>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {/* <SelectItem value="add-new"> */}
            {type === "sales" && (
              <AddModal
                btnName="Add Client"
                className="w-full"
                type={"Add"}
                cta="Add New"
                modalHead="Client"
                onSubmit={(newClient) => {}}
              />
            )}
            {type === "purchase" && (
              <AddModal
                btnName="Add Vendor"
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
                {formattedData?.map((client) => (
                  <SelectItem
                    key={client.id}
                    name="buyer_enterperise_id"
                    value={client.id}
                    onValueChange={handleChangeOrder}
                  >
                    {client.name}
                  </SelectItem>
                ))}
              </>
            ) : (
              <>
                <SelectItem value="Vendor 1">Vendor 1</SelectItem>
                <SelectItem value="Vendor 2">Vendor 2</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
        {/* {name === "Invoice" && (
          <>
            <Label>Order</Label>
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
                <SelectItem value="Ex Item 1">External Item</SelectItem>
                <SelectItem value="Item 2">Internal Item 1</SelectItem>
                <SelectItem value="Item 3">Internal Item 2</SelectItem>
              </SelectContent>
            </Select>
          </>
        )} */}
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
                {goodsData?.map((goods) => (
                  <SelectItem key={goods.id} value={goods.productName}>
                    {goods.productName}
                  </SelectItem>
                ))}
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
              cta == "offer" ? (order.type = "offer") : (order.type = "Bid")
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
