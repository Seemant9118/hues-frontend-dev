"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputWithLabel from "../ui/InputWithLabel";
import { RotateCw } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { LocalStorageService } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateNegotiation } from "@/services/Orders_Services/Orders_Services";
import { toast } from "sonner";
import { order_api } from "@/api/order_api/order_api";
import moment from "moment";

const OfferPrice = ({ btnName, offerDetails }) => {
  const params = useParams();
  const userId = LocalStorageService.get("user_profile");
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const isSales = pathName.includes("sales-orders");
  const date = moment(new Date()).format("DD-MM-YYYY");

  const [open, setOpen] = useState(false);

  const [bidOffer, setBidOffer] = useState({
    order_id: Number(params.order_id),
    order_item_id: offerDetails.id,
    price_type: isSales ? "OFFER" : "BID",
    createdBy: userId,
    date: date,
    status: isSales ? "OFFER_SUBMITTED" : "BID_SUBMITTED",
    price: "",
  });
  console.log(bidOffer);

  const changeOfferMutation = useMutation({
    mutationFn: (data) => CreateNegotiation(data),
    onSuccess: () => {
      toast.success("Your Offer change request sent");
      setOpen(false);
      setBidOffer({
        order_id: "",
        order_item_id: "",
        price_type: "",
        createdBy: "",
        date: "",
        status: "",
        price: "",
      });
      queryClient.invalidateQueries([order_api.getOrderDetails.endpointKey]);
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const handleSubmitOffer = () => {
    changeOfferMutation.mutate(bidOffer);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {btnName && (
          <Button variant="blue_outline" className="w-32">
            Offer Price
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-2">
        <DialogTitle>Offer Price </DialogTitle>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
            <InputWithLabel
              name="Item"
              id="name"
              value={
                offerDetails.productType === "GOODS"
                  ? offerDetails.productDetails.productName
                  : offerDetails.productDetails.serviceName
              }
              disabled={true}
              className="disabled:text-slate-800"
            />
            <InputWithLabel
              name="Quantity"
              id="quantity"
              value={offerDetails?.quantity}
              disabled={true}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputWithLabel
              name="Price"
              id="price"
              value={"₹"+offerDetails?.totalAmount}
              disabled={true}
            />
            <InputWithLabel
              name="Offer Price"
              id="offer_price"
              value={bidOffer.price}
              onChange={(e) =>
                setBidOffer((prev) => ({ ...prev, price: e.target.value }))
              }
            ></InputWithLabel>
          </div>
          <div className="border "></div>

          <div className="flex justify-end items-center gap-2">
            <Button
              variant="outline"
              className="w-32"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitOffer}>Create Offer Price</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OfferPrice;
