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

const OfferPrice = (btnName) => {
  return (
    <Dialog>
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
            <InputWithLabel name="Item" id="name" />
            <InputWithLabel name="Quantity" id="quantity" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <InputWithLabel name="Price" id="price" />
            <InputWithLabel name="Offer Price" id="price" />
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

export default OfferPrice;
