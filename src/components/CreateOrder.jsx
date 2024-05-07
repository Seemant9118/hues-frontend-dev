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
import { useCreateSalesColumns } from "@/components/columns/useCreateSalesColumns";
import { DataTable } from "@/components/table/data-table";
import Wrapper from "./Wrapper";
import SubHeader from "./Sub-header";
import { Button } from "./ui/button";
import SuccessModal from "./Modals/SuccessModal";
import AddModal from "./Modals/AddModal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import {
  CreateEnterpriseUser,
  GetEnterpriseUsers,
} from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { LocalStorageService } from "@/lib/utils";
import { goods_api } from "@/api/inventories/goods/goods";
import { GetAllProductGoods } from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import { services_api } from "@/api/inventories/services/services";
import { GetAllProductServices } from "@/services/Inventories_Services/Services_Inventories/Services_Inventories";
import { CreateOrderService } from "@/services/Orders_Services/Orders_Services";
import { toast } from "sonner";
import { order_api } from "@/api/order_api/order_api";
import Loading from "./Loading";

const CreateOrder = ({ onCancel, name, cta, type }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get("enterprise_Id");

  const [selectedItem, setSelectedItem] = useState({
    product_name: "",
    product_type: "",
    product_id: "",
    quantity: null,
    unit_price: null,
    gst_per_unit: null,
    total_amount: null,
    total_gst_amount: null,
  });
  const [order, setOrder] = useState(
    cta == "offer"
      ? {
          seller_enterprise_id: enterpriseId,
          buyer_enterperise_id: null,
          gst_amount: null,
          amount: null,
          order_type: "SALES",
          order_items: [],
        }
      : {
          seller_enterprise_id: null,
          buyer_enterperise_id: enterpriseId,
          gst_amount: null,
          amount: null,
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
      product_type: "SERVICE",
      product_name: service.serviceName,
    })) || [];

  const itemData = formattedGoodsData.concat(formattedServicesData); // both goods & services concatinated

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
        queryKey:
          cta === "offer"
            ? [order_api.getSales.endpointKey]
            : [order_api.getPurchases.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const handleSetTotalAmt = () => {
    const totalAmount = order.order_items.reduce((totalAmt, orderItem) => {
      return totalAmt + orderItem.total_amount;
    }, 0);

    const totalGstAmt = order.order_items.reduce((totalGst, orderItem2) => {
      return totalGst + orderItem2.total_gst_amount;
    }, 0);

    return { totalAmount, totalGstAmt };
  };

  // handling submit fn
  const handleSubmit = () => {
    const { totalAmount, totalGstAmt } = handleSetTotalAmt();

    orderMutation.mutate({
      ...order,
      amount: parseFloat(totalAmount.toFixed(2)),
      gst_amount: parseFloat(totalGstAmt.toFixed(2)),
    });
  };

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center gap-4 p-4 rounded-sm border-neutral-200 border">
        <Label>{cta == "offer" ? "Client" : "Vendor"}</Label>
        <Select
          defaultValue=""
          onValueChange={(value) => {
            cta === "offer"
              ? setOrder((prev) => ({ ...prev, buyer_enterperise_id: value }))
              : setOrder((prev) => ({ ...prev, seller_enterprise_id: value }));
          }}
        >
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {/* if expected client is not in the list add a new client */}
            {type === "sales" && (
              <AddModal
                type={"Add Client"}
                cta="client"
                btnName="Add"
                mutationFunc={CreateEnterpriseUser}
              />
            )}
            {/* if expected vendor is not in the list add a new vendor */}
            {type === "purchase" && (
              <AddModal
                type={"Add Vendor"}
                cta="vendor"
                btnName="Add"
                mutationFunc={CreateEnterpriseUser}
              />
            )}

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
                  unit_price: selectedItemData.amount,
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
                const totalAmt = parseFloat(
                  (e.target.value * selectedItem.unit_price).toFixed(2)
                ); // totalAmt excluding gst
                const GstAmt = parseFloat(
                  (totalAmt * (selectedItem.gst_per_unit / 100)).toFixed(2)
                ); // total gstAmt
                setSelectedItem((prev) => ({
                  ...prev,
                  quantity: Number(e.target.value),
                  total_amount: totalAmt,
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

      {/* selected itme table */}
      <DataTable data={order.order_items} columns={createSalesColumns} />

      <div className="h-[1px] bg-neutral-300 mt-auto"></div>

      <div className="flex justify-end items-center gap-4 ">
        <Button onClick={onCancel} variant={"outline"}>
          Cancel
        </Button>

        <SuccessModal
          onClose={() => {
            onCancel();
          }}
        >
          <Button
            disabled={!selectedItem && !order}
            onClick={
              handleSubmit // invoke handle submit fn
            }
          >
            Create
          </Button>
        </SuccessModal>
      </div>
    </Wrapper>
  );
};

export default CreateOrder;
