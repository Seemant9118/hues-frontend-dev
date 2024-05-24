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
import { useQuery } from "@tanstack/react-query";
import { order_api } from "@/api/order_api/order_api";
import { GetNegotiationDetails } from "@/services/Orders_Services/Orders_Services";
import { useParams } from "next/navigation";
import Loading from "../ui/Loading";
import { Input } from "../ui/input";

const ChangeOfferPrice = ({ offerDetails }) => {
  const params = useParams();
  const order_id = params.order_id;
  const item_id = offerDetails.id;

  const [open, setOpen] = useState(false);
  const { isLoading, data } = useQuery({
    queryKey: [order_api.getNegotiationDetails.endpointKey],
    queryFn: () => GetNegotiationDetails(order_id, item_id),
    select: (data) => data.data.data,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <RotateCw size={24} strokeWidth={3} />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-2">
        <DialogTitle>Change Offer </DialogTitle>
        {isLoading && !data && <Loading />}

        {!isLoading && data && (
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

            {data.map((negotiationItem) => (
              <div key={negotiationItem.id} className="flex flex-col gap-2 ">
                <span className="text-[#3288ED] text-xs">
                  {negotiationItem.date}
                </span>
                <div className="grid grid-cols-2 px-10 gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold">Offered Price</span>
                    <span className="font-bold text-slate-700">
                    ₹{offerDetails.totalAmount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Your Price</span>
                    <span className="font-bold text-slate-700">
                    ₹{negotiationItem.price}
                    </span>
                  </div>
                </div>
                {/* input fields */}
                <div className="grid grid-cols-2 gap-2 px-10">
                  <div>
                    <span className="font-bold">Offered Price</span>
                    <Input
                      name="offeredPrice"
                      value={"₹"+negotiationItem.price}
                      disabled={true}
                    />
                  </div>
                  <div>
                    <span className="font-bold">Your Price</span>
                    <Input name="offeredPrice" />
                  </div>
                </div>
              </div>
            ))}

            <div className="border "></div>

            <div className="flex justify-end items-center gap-2">
              <Button
                variant="outline"
                className="w-32"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button className="w-32">Change Offer</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOfferPrice;
