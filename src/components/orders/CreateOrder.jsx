import { client_enterprise } from "@/api/enterprises_user/client_enterprise/client_enterprise";
import { vendor_enterprise } from "@/api/enterprises_user/vendor_enterprise/vendor_enterprise";
import { goods_api } from "@/api/inventories/goods/goods";
import { services_api } from "@/api/inventories/services/services";
import { order_api } from "@/api/order_api/order_api";
import { useCreateSalesColumns } from "@/components/columns/useCreateSalesColumns";
import { DataTable } from "@/components/table/data-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocalStorageService } from "@/lib/utils";
import { getClients } from "@/services/Enterprises_Users_Service/Client_Enterprise_Services/Client_Enterprise_Service";
import { CreateEnterpriseUser } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { getVendors } from "@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service";
import {
  GetAllProductGoods,
  GetProductGoodsVendor,
} from "@/services/Inventories_Services/Goods_Inventories/Goods_Inventories";
import {
  GetAllProductServices,
  GetServicesVendor,
} from "@/services/Inventories_Services/Services_Inventories/Services_Inventories";
import { CreateOrderService } from "@/services/Orders_Services/Orders_Services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import AddModal from "../Modals/AddModal";
import EmptyStageComponent from "../ui/EmptyStageComponent";
import ErrorBox from "../ui/ErrorBox";
import SubHeader from "../ui/Sub-header";
import { Button } from "../ui/button";
import Wrapper from "../wrappers/Wrapper";

const CreateOrder = ({ onCancel, name, cta, type }) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get("enterprise_Id");

  const [errorMsg, setErrorMsg] = useState({});
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
    queryKey: [
      client_enterprise.getClients.endpointKey,
      vendor_enterprise.getVendors.endpointKey,
    ],
    queryFn: () => {
      if (cta === "offer") {
        return getClients(enterpriseId);
      } else {
        return getVendors(enterpriseId);
      }
    },

    select: (customerData) => customerData.data.data,
  });

  // client goods fetching
  const { data: goodsData } = useQuery({
    queryKey: [goods_api.getAllProductGoods.endpointKey],
    queryFn: () => GetAllProductGoods(enterpriseId),
    select: (goodsData) => goodsData.data.data,
    enabled: !!cta == "offer",
  });
  const formattedGoodsData =
    goodsData?.map((good) => ({
      ...good,
      product_type: "GOODS",
      product_name: good.productName,
    })) || [];

  // client services fetching
  const { data: servicesData } = useQuery({
    queryKey: [services_api.getAllProductServices.endpointKey],
    queryFn: () => GetAllProductServices(enterpriseId),
    select: (servicesData) => servicesData.data.data,
    enabled: !!cta == "offer",
  });
  const formattedServicesData =
    servicesData?.map((service) => ({
      ...service,
      product_type: "SERVICE",
      product_name: service.serviceName,
    })) || [];

  // both client goods & client services concatinated
  const itemData = formattedGoodsData.concat(formattedServicesData);

  // vendor goods fetching
  const { data: vendorGoodsData } = useQuery({
    queryKey: [
      goods_api.vendorProductGoods.endpointKey,
      order.seller_enterprise_id,
    ],
    queryFn: () => GetProductGoodsVendor(order.seller_enterprise_id),
    select: (vendorGoodsData) => vendorGoodsData.data.data,
    enabled: !!order.seller_enterprise_id,
  });
  const formattedVendorGoodsData =
    vendorGoodsData?.map((good) => ({
      ...good,
      product_type: "GOODS",
      product_name: good.productName,
    })) || [];

  // vendor services fetching
  const { data: vendorServicesData } = useQuery({
    queryKey: [
      services_api.vendorServices.endpointKey,
      order.seller_enterprise_id,
    ],
    queryFn: () => GetServicesVendor(order.seller_enterprise_id),
    select: (vendorServicesData) => vendorServicesData.data.data,
    enabled: !!order.seller_enterprise_id,
  });
  const formattedVendorServicesData =
    vendorServicesData?.map((service) => ({
      ...service,
      product_type: "SERVICE",
      product_name: service.serviceName,
    })) || [];

  // both client goods & client services concatinated
  const vendorItemData = [
    ...(formattedVendorGoodsData || []),
    ...(formattedVendorServicesData || []),
  ];

  // mutation - create order
  const orderMutation = useMutation({
    mutationFn: CreateOrderService,
    onSuccess: () => {
      toast.success(
        cta === "offer"
          ? "Sales Order Created Successfully"
          : "Purchase Order Created Successfully"
      );
      onCancel();
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

  // validations
  const validation = ({ order, selectedItem }) => {
    let error = {};

    if (cta == "offer") {
      if (order?.buyer_enterperise_id == null) {
        error.buyer_enterperise_id = "*Please select a client";
      }
      if (order?.order_item?.length === 0) {
        error.order_item = "*Please add atleast one item to create order";
      }
      if (selectedItem.quantity === null) {
        error.quantity = "*Required Quantity";
      }
      if (selectedItem.unit_price === null) {
        error.unit_price = "*Required Price";
      }
      if (selectedItem.gst_per_unit === null) {
        error.gst_per_unit = "*Required GST (%)";
      }
      if (selectedItem.total_amount === null) {
        error.total_amount = "*Required Amount";
      }
    } else {
      if (order?.seller_enterprise_id == null) {
        error.seller_enterprise_id = "*Please select a vendor";
      }
      if (order?.order_item?.length === 0) {
        error.order_item = "*Please add atleast one item to create order";
      }
      if (selectedItem.quantity === null) {
        error.quantity = "*Required Quantity";
      }
      if (selectedItem.unit_price === null) {
        error.unit_price = "*Required Price";
      }
      if (selectedItem.gst_per_unit === null) {
        error.gst_per_unit = "*Required GST (%)";
      }
      if (selectedItem.total_amount === null) {
        error.total_amount = "*Required Amount";
      }
    }

    return error;
  };

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
    const isError = validation({ order: order, selectedItem: selectedItem });

    if (Object.keys(isError).length === 0) {
      orderMutation.mutate({
        ...order,
        amount: parseFloat(totalAmount.toFixed(2)),
        gst_amount: parseFloat(totalGstAmt.toFixed(2)),
      });
      setErrorMsg({});
    }
    setErrorMsg(isError);
  };

  if (!enterpriseId) {
    return (
      <div className="flex flex-col justify-center">
        <EmptyStageComponent heading="Please Complete Your Onboarding to Create Order" />
        <Button variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <Wrapper>
      <SubHeader name={name}></SubHeader>
      <div className="flex items-center gap-4 p-4 rounded-sm border-neutral-200 border">
        <Label>{cta == "offer" ? "Client" : "Vendor"}</Label>
        <div className="flex flex-col gap-1">
          <Select
            defaultValue=""
            onValueChange={(value) => {
              cta === "offer"
                ? setOrder((prev) => ({ ...prev, buyer_enterperise_id: value }))
                : setOrder((prev) => ({
                    ...prev,
                    seller_enterprise_id: value,
                  }));
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
                  {customerData
                    ?.filter((customer) => customer.client)
                    ?.map((customer) => (
                      <SelectItem
                        key={customer.enterpriseId}
                        value={customer?.client?.id}
                      >
                        {customer.client
                          ? customer.client.name
                          : customer.invitation.userDetails.name}
                      </SelectItem>
                    ))}
                </>
              ) : (
                <>
                  {customerData
                    ?.filter((customer) => customer.vendor)
                    ?.map((customer) => (
                      <SelectItem
                        key={customer.enterpriseId}
                        value={customer?.vendor?.id}
                      >
                        {customer.vendor
                          ? customer.vendor.name
                          : customer.invitation.userDetails.name}
                      </SelectItem>
                    ))}
                </>
              )}
            </SelectContent>
          </Select>
          {cta === "offer"
            ? errorMsg.buyer_enterperise_id && (
                <ErrorBox msg={errorMsg.buyer_enterperise_id} />
              )
            : errorMsg.seller_enterprise_id && (
                <ErrorBox msg={errorMsg.seller_enterprise_id} />
              )}
        </div>
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
            <div className="flex flex-col gap-1">
              <Select
                disabled={
                  (cta === "offer" && order.buyer_enterperise_id == null) ||
                  order.seller_enterprise_id == null
                }
                // defaultValue={selectedItem.product_id}
                onValueChange={(value) => {
                  const selectedItemData =
                    cta === "offer"
                      ? itemData?.find((item) => value === item.id)
                      : vendorItemData?.find((item) => value === item.id);

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
                  {cta === "offer" &&
                    itemData?.map((item) => (
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

                  {cta !== "offer" &&
                    vendorItemData?.map((item) => (
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
              {/* {errorMsg.name && <ErrorBox msg={errorMsg.name} />} */}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Label>Quantity:</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled={
                  (cta === "offer" && order.buyer_enterperise_id == null) ||
                  order.seller_enterprise_id == null
                }
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
              {errorMsg.quantity && <ErrorBox msg={errorMsg.quantity} />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Price:</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled={
                  (cta === "offer" && order.buyer_enterperise_id == null) ||
                  order.seller_enterprise_id == null
                }
                value={selectedItem.unit_price}
                className="max-w-20"
                onChange={(e) => {
                  setSelectedItem((prevValue) => ({
                    ...prevValue,
                    unit_price: Number(e.target.value),
                  }));
                }}
              />
              {errorMsg.unit_price && <ErrorBox msg={errorMsg.unit_price} />}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>GST (%) :</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.gst_per_unit}
                className="max-w-20"
              />
              {errorMsg.gst_per_unit && (
                <ErrorBox msg={errorMsg.gst_per_unit} />
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label>Amount:</Label>
            <div className="flex flex-col gap-1">
              <Input
                disabled
                value={selectedItem.total_amount}
                className="max-w-20"
              />
              {errorMsg.total_amount && (
                <ErrorBox msg={errorMsg.total_amount} />
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedItem((prev) => ({
                ...prev,
                product_id: "",
                product_type: "",
                product_name: "",
                unit_price: "",
                gst_per_unit: "",
              }));
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={Object.values(selectedItem).some(
              (value) => value === "" || value === null || value === undefined
            )} // if any item of selectedItem is empty then button must be disabled
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
              setErrorMsg({});
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
        {/* <SuccessModal
          onClose={() => {
            onCancel();
          }}
        > */}
        <Button
          onClick={
            handleSubmit // invoke handle submit fn
          }
        >
          Create
        </Button>
        {/* </SuccessModal> */}
      </div>
    </Wrapper>
  );
};

export default CreateOrder;
