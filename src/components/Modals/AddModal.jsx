"use client";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Layers2 } from "lucide-react";

import InputWithLabel from "@/components/InputWithLabel";

const AddModal = ({ type }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"blue_outline"} size="sm">
          <Layers2 size={14} />
          Add {type}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Add {type}</DialogTitle>
        <div className="flex flex-col gap-4">
          <InputWithLabel
            name="Enter Name"
            id="name"
            onChange={() => {}}
            value={""}
          />
          <InputWithLabel
            name="Add Address"
            id="address"
            onChange={() => {}}
            value={""}
          />
          <InputWithLabel
            name="Email"
            id="email"
            onChange={() => {}}
            value={""}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputWithLabel
              name="Phone"
              id="phone"
              onChange={() => {}}
              value={""}
            />
            <InputWithLabel
              name="PAN"
              id="pan"
              onChange={() => {}}
              value={""}
            />
          </div>
        </div>
        <div className="h-[1px] bg-neutral-300"></div>

        <div className="flex justify-end items-center gap-4 mt-auto">
          <DialogClose asChild>
            <Button onClick={() => {}} variant={"outline"}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={() => {}}>Add {type}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
