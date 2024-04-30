"use client";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import InputWithLabel from "../InputWithLabel";
import { RotateCw } from "lucide-react";

const ChangeOfferPrice = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <RotateCw size={24} strokeWidth={3} />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-2">
        <DialogTitle>Change Offer </DialogTitle>
        <div className="flex flex-col gap-4">
          <InputWithLabel name="Item" id="name"/>

          <div className="flex flex-col gap-2 ">
            <span className="text-[#3288ED] text-xs">24/04/2024</span>
            <div className="grid grid-cols-2 px-10 gap-2">
              <div className="flex flex-col">
                <span className="font-bold">Offered Price</span>
                <span className="font-bold text-slate-700">$485</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Your Price</span>
                <span className="font-bold text-slate-700">$466</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#3288ED] text-xs">27/04/2024</span>
            <div className="grid grid-cols-2 px-10 gap-2">
              <div className="flex flex-col">
                <span className="font-bold">Offered Price</span>
                <span className="font-bold text-slate-700">$485</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-bold">Your Price</span>
                <span className="font-bold text-slate-700">$466</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[#3288ED] text-xs">01/05/2024</span>
            <div className="grid grid-cols-2 px-10 gap-2">
              <div className="flex flex-col">
                <InputWithLabel
                  className="font-bold text-slate-700"
                  name="Offered Price"
                  value="$485"
                />
              </div>
              <div className="flex flex-col">
                <InputWithLabel
                  className="font-bold text-slate-700"
                  name="Your Price"
                />
              </div>
            </div>
          </div>

          <div className="border "></div>

          <div className="flex justify-end items-center gap-2">
            <Button variant="outline" className="w-32">
              Cancel
            </Button>
            <Button className="w-32">Change Offer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeOfferPrice;
