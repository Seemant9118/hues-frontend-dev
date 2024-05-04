"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputWithLabel from "../InputWithLabel";
import { RotateCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { order_api } from "@/api/order_api/order_api";
import { GetNegotiationDetails } from "@/services/Orders_Services/Orders_Services";
import Loading from "../Loading";

const ChangeOfferPrice = ({ Item_Name, order_id, item_id, offeredPrice }) => {
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
              value={Item_Name}
              disabled={true}
            />

            {data.map((negotiatioItem) => (
              <div key={negotiatioItem.id} className="flex flex-col gap-2 ">
                <span className="text-[#3288ED] text-xs">
                  {negotiatioItem.date}
                </span>
                <div className="grid grid-cols-2 px-10 gap-2">
                  <div className="flex flex-col">
                    <span className="font-bold">Offered Price</span>
                    <span className="font-bold text-slate-700">
                      {offeredPrice}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold">Your Price</span>
                    <span className="font-bold text-slate-700">
                      {negotiatioItem.price}
                    </span>
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
