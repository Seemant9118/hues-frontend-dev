"use client";
import { order_api } from "@/api/order_api/order_api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LocalStorageService } from "@/lib/utils";
import {
  AccpetRejectNegotiation,
  CreateNegotiation,
  GetNegotiationDetails,
} from "@/services/Orders_Services/Orders_Services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCw } from "lucide-react";
import moment from "moment";
import { useParams, usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { usenegotiationHistoryColumns } from "../columns/negotiationHistoryColumns";
import { DataTable } from "../table/data-table";
import InputWithLabel from "../ui/InputWithLabel";
import Loading from "../ui/Loading";
import { Input } from "../ui/input";

const ChangeOfferPrice = ({ offerDetails }) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const pathName = usePathname();
  const userId = LocalStorageService.get("user_profile");
  const isSales = pathName.includes("sales-orders");
  const date = moment(new Date()).format("DD-MM-YYYY");
  const order_id = params.order_id;
  const item_id = offerDetails.id;

  const [changeOffer, setChangeOffer] = useState({
    order_id: Number(params.order_id),
    order_item_id: offerDetails.id,
    price_type: isSales ? "OFFER" : "BID",
    createdBy: userId,
    date: date,
    status: isSales ? "OFFER_SUBMITTED" : "BID_SUBMITTED",
    price: "",
  });
  const [open, setOpen] = useState(false);

  // negotiation data
  const { isLoading, data: negotiationData } = useQuery({
    queryKey: [order_api.getNegotiationDetails.endpointKey, order_id, item_id],
    queryFn: () => GetNegotiationDetails(order_id, item_id),
    select: (data) => data.data.data,
  });

  // change offer mutation
  const changeOfferMutation = useMutation({
    mutationFn: (data) => CreateNegotiation(data),
    onSuccess: () => {
      toast.success("Your Offer change request sent");
      queryClient.invalidateQueries([
        order_api.getNegotiationDetails.endpointKey,
      ]);
      setChangeOffer({
        order_id: "",
        order_item_id: "",
        price_type: "",
        createdBy: "",
        date: "",
        status: "",
        price: "",
      });
      setOpen(false);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const mutationAccept = useMutation({
    mutationFn: (data) => AccpetRejectNegotiation(data),
    onSuccess: () => {
      toast.success("Accepted current negotiation Price");
      queryClient.invalidateQueries([order_api.getOrderDetails.endpointKey]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const handleAcceptNegotiation = (row) => {
    mutationAccept.mutate({
      order_id: order_id,
      item_id: item_id,
      status: "ACCEPTED",
    });
  };

  const handleChangeOffer = () => {
    changeOfferMutation.mutate(changeOffer);
  };

  const negotiationHistoryColumns = usenegotiationHistoryColumns();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <RotateCw size={24} strokeWidth={3} />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-2">
        <DialogTitle>Change Offer </DialogTitle>
        {isLoading && <Loading />}

        {!isLoading && negotiationData && (
          <div className="flex flex-col gap-4">
            <InputWithLabel
              name="Item"
              id="name"
              value={
                offerDetails?.productType === "GOODS"
                  ? offerDetails?.productDetails?.productName
                  : offerDetails?.productDetails?.serviceName
              }
              disabled={true}
            />
            {negotiationData.length === 0 && (
              <div className="text-xs font-bold text-slate-800">
                Want to Negotiate price as per your choice?
              </div>
            )}

            {/* Original Price */}
            <div className="flex justify-between">
              <span className="font-bold">Original Price</span>
              <span className="font-bold text-primary">
                ₹{offerDetails.totalAmount}
              </span>
            </div>

            <div className="font-bold">History</div>
            <DataTable
              columns={negotiationHistoryColumns}
              data={negotiationData}
            />

            <div className="flex justify-between items-end">
              <Button
                className="bg-green-600 text-white hover:bg-green-400 font-bold w-32"
                onClick={handleAcceptNegotiation}
              >
                Accept
              </Button>
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold w-32">Your Price</span>
                <Input
                  className="w-32 border-2 rounded-md"
                  name="price"
                  value={changeOffer.price}
                  onChange={(e) =>
                    setChangeOffer((prevValue) => ({
                      ...prevValue,
                      price: e.target.value,
                    }))
                  }
                />

                <div className="flex justify-end items-center gap-2">
                  {/* <Button
                    variant="outline"
                    className="w-32"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button> */}
                  <Button
                    className="w-32"
                    onClick={() => {
                      handleChangeOffer();
                      setOpen(false);
                    }}
                  >
                    Change Offer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOfferPrice;
