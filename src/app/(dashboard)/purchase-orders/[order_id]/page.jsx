"use client";

import { order_api } from "@/api/order_api/order_api";
import Loading from "@/components/Loading";
import SubHeader from "@/components/Sub-header";
import Wrapper from "@/components/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { OrderDetails } from "@/services/Orders_Services/Orders_Services";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { OrderColumns } from "./OrderColumns";

const ViewOrder = () => {
  const router = useRouter();
  const params = useParams();
  const items = [
    {
      item: "Crocin ",
      quantity: "2",
      price: "30",
      status: "New",
    },
    {
      item: "Crocin ",
      quantity: "2",
      price: "30",
      status: "Accepted",
    },
    {
      item: "Crocin ",
      quantity: "2",
      price: "30",
      status: "Negotiation",
    },
  ];

  const { isLoading, data } = useQuery({
    queryKey: [order_api.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (data) => data.data.data,
  });

  return (
    <Wrapper className="relative">
      {isLoading && !data && <Loading />}
      {!isLoading && data && (
        <>
          <SubHeader name={"ORDER ID: #" + params.order_id}></SubHeader>
          <DataTable columns={OrderColumns} data={data.orderItems}></DataTable>

          <div className="absolute bottom-0 right-0">
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="w-32"
                onClick={() => {
                  router.push("/purchase-orders");
                }}
              >
                {" "}
                Close{" "}
              </Button>
            </div>
          </div>
        </>
      )}
    </Wrapper>
  );
};

export default ViewOrder;
