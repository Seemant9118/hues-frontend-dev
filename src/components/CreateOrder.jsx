import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCreateSalesColumns } from "@/components/columns/useCreateSalesColumns";
import { DataTable } from "@/components/table/data-table";
import Wrapper from "./Wrapper";
import SubHeader from "./Sub-header";
import { Button } from "./ui/button";
import SuccessModal from "./Modals/SuccessModal";
import { CloudFog, Plus } from "lucide-react";
import AddModal from "./Modals/AddModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import { GetEnterpriseUsers } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { LocalStorageService } from "@/lib/utils";
import { goods_api } from "@/api/inventories/goods/goods";
import { GetAllProductGoods } from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import { services_api } from "@/api/inventories/services/services";
import { GetAllProductServices } from "@/services/Inventories_Services/Services_Inventories/Services_Inventories";
import { CreateOrderService } from "@/services/Orders_Services/Orders_Services";
import { toast } from "sonner";
import { order_api } from "@/api/order_api/order_api";

const CreateOrder = ({ onCancel, onSubmit, name, cta, type }) => {
  const queryClient = useQueryClient();

  const enterpriseId = LocalStorageService.get("enterprise_Id");
  const [selectedItem, setSelectedItem] = useState({
    product_name: "",
    product_type: "",
    product_id: "",
    quantity: "",
    unit_price: "",
    gst_per_unit: "",
    total_amount: "", // total amount + gst amount
    total_gst_amount: "",
  });

  const [order, setOrder] = useState(
    cta == "offer"
      ? {
          seller_enterprise_id: enterpriseId,
          buyer_enterperise_id: "",
          gst_amount: "",
          amount: "", // total amount + gst amount
          order_type: "SALES",
          order_items: [],
        }
      : {
          seller_enterprise_id: enterpriseId,
          buyer_enterperise_id: "",
          gst_amount: "",
          amount: "", // total amount + gst amount
          order_type: "PURCHASE",
          order_items: [],
        }
  );

  const createSalesColumns = useCreateSalesColumns(setOrder);

  // client/vendor fetching
  const { data: customerData } = useQuery({
    queryKey: [enterprise_user.getEnterpriseUsers.endpointKey],
    queryFn: () =>
      GetEnterpriseUsers(
        cta === "offer"
          ? {
              user_type: "client",
              enterprise_id: enterpriseId,
            }
          : {
              user_type: "vendor",
              enterprise_id: enterpriseId,
            }
      ),
    select: (customerData) => customerData.data.data,
  });
  let formattedData = [];
  if (customerData) {
    formattedData = customerData.flatMap((user) => ({
      ...user.mappedUserEnterprise,
      userId: user.id,
    }));
  }

  // goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [goods_api.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (goodsData) => goodsData.data.data,
  });
  const formattedGoodsData =
    goodsData?.map((good) => ({
      ...good,
      product_type: "GOODS",
      product_name: good.productName,
    })) || [];

  // services fetching
  const { data: servicesData } = useQuery({
    queryKey: [services_api.getAllProductServices.endpointKey],
    queryFn: () => GetAllProductServices(enterpriseId),
    select: (servicesData) => servicesData.data.data,
  });

  const formattedServicesData =
    servicesData?.map((service) => ({
      ...service,
      product_type: "SERVICES",
      product_name: service.serviceName,
    })) || [];

  const itemData = formattedGoodsData.concat(formattedServicesData);

  // mutation - create order
  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: () => {
      toast.success(
        cta === "offer"
          ? "Sales Order Created Successfully"
          : "Purchase Order Created Successfully"
      );
      queryClient.invalidateQueries({
        queryKey: [order_api.getSales.endpointKey],
      });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleCreateOrder = () => {
    const totalAmount = order.order_items.reduce((totalAmt, orderItem) => {
      return totalAmt + orderItem.total_amount;
    }, 0);

    const totalGstAmt = order.order_items.reduce((totalGst, orderItem2) => {
      return totalGst + orderItem2.total_gst_amount;
    }, 0);

    setOrder((prevOrder) => ({
      ...prevOrder,
      amount: totalAmount,
      gst_amount: totalGstAmt,
    }));

    // posting the data
    // orderMutation.mutate(order);
  };

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center gap-4 p-4 rounded-sm border-neutral-200 border">
        <Label>{cta == "offer" ? "Client" : "Vendor"}</Label>
        <Select
          defaultValue=""
          onValueChange={(value) =>
            setOrder((prev) => ({ ...prev, buyer_enterperise_id: value }))
          }
        >
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
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </>
            ) : (
              <>
                {formattedData?.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
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
              defaultValue={selectedItem.product_id}
              onValueChange={(value) => {
                const selectedItemData = itemData?.find(
                  (item) => value === item.id
                );

                setSelectedItem((prev) => ({
                  ...prev,
                  product_id: value,
                  product_type: selectedItemData.product_type,
                  product_name: selectedItemData.product_name,
                  unit_price: selectedItemData.rate,
                  gst_per_unit: selectedItemData.gstPercentage,
                }));
              }}
            >
              <SelectTrigger className="max-w-xs gap-5">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {itemData?.map((item) => (
                  <SelectItem
                    disabled={
                      !!order.order_items.find(
                        (itemO) => itemO.product_id === item.id
                      )
                    }
                    key={item.id}
                    value={item.id}
                  >
                    {item.product_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label>Quantity:</Label>
            <Input
              value={selectedItem.quantity}
              onChange={(e) => {
                const AmtPerUnit = e.target.value * selectedItem.unit_price;
                // (selectedItem.total_amount * selectedItem.gst_per_unit) / 100;
                const GstAmt = (AmtPerUnit * selectedItem.gst_per_unit) / 100;
                const totalAmtWithGst = AmtPerUnit + GstAmt;

                setSelectedItem((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                  total_amount: totalAmtWithGst,
                  total_gst_amount: GstAmt,
                }));
              }}
              className="max-w-20"
            />
          </div>

          <div className="flex items-center gap-4">
            <Label>Price:</Label>
            <Input value={selectedItem.unit_price} className="max-w-20" />
          </div>

          <div className="flex items-center gap-4">
            <Label>GST (%) :</Label>
            <Input value={selectedItem.gst_per_unit} className="max-w-20" />
          </div>

          <div className="flex items-center gap-4">
            <Label>Amount:</Label>
            <Input value={selectedItem.total_amount} className="max-w-20" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button
            onClick={() => {
              setOrder((prev) => ({
                ...prev,
                order_items: [...prev.order_items, selectedItem],
              }));
              setSelectedItem({
                product_name: "",
                product_type: "",
                product_id: "",
                quantity: "",
                unit_price: "",
                gst_per_unit: "",
                total_amount: "", // total amount + gst amount
                total_gst_amount: "",
              });
            }}
            variant="blue_outline"
          >
            Add
          </Button>
        </div>
      </div>
      <DataTable data={order.order_items} columns={createSalesColumns} />
      <div className="h-[1px] bg-neutral-300 mt-auto"></div>

      <div className="flex justify-end items-center gap-4 ">
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>

        <SuccessModal
          onClose={() => {
            orderMutation.mutate(order);
            // onSubmit(
            //   order,
            //   cta == "offer" ? (order.type = "offer") : (order.type = "Bid")
            // );
          }}
        >
          <Button onClick={handleCreateOrder}>Create</Button>
        </SuccessModal>
      </div>
    </Wrapper>
  );
};

export default CreateOrder;
