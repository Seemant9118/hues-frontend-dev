"use client";

import { order_api } from "@/api/order_api/order_api";
import Loading from "@/components/ui/Loading";
import SubHeader from "@/components/ui/Sub-header";
import Wrapper from "@/components/wrappers/Wrapper";
import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { OrderDetails } from "@/services/Orders_Services/Orders_Services";
import { useOrderColumns } from "./useOrderColumns";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const ViewOrder = () => {
  const router = useRouter();
  const params = useParams();

  const { isLoading, data: orderDetails } = useQuery({
    queryKey: [order_api.getOrderDetails.endpointKey],
    queryFn: () => OrderDetails(params.order_id),
    select: (data) => data.data.data,
  });

  const OrderColumns = useOrderColumns(orderDetails);

  return (
    <Wrapper className="relative">
      {isLoading && !orderDetails && <Loading />}
      {!isLoading && orderDetails && (
        <>
          <SubHeader name={"ORDER ID: #" + params.order_id}></SubHeader>
          <DataTable
            columns={OrderColumns}
            data={orderDetails.orderItems}
          ></DataTable>

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
