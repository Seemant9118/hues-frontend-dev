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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Layers2 ,Fingerprint} from "lucide-react";

import InputWithLabel from "@/components/InputWithLabel";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";


const AddModal = ({ type }) => {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"blue_outline"} size="sm">
        {
          type === 'Save GST Credentials' ? <Fingerprint size={14}/> : <Layers2 size={14}/>
        }
        
          {type}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{type}</DialogTitle>
        <div className="flex flex-col gap-4">
          <InputWithLabel
            name="Enter Name"
            id="name"
            onChange={() => { }}
            value={""}
          />
          {
            type === 'Add Client' && (
              <div className="flex flex-col gap-1">
                <Label>Select Vendor</Label>
                <Select >
                  <SelectTrigger className="w-full rounded">
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer 1">Vendor 1</SelectItem>
                    <SelectItem value="Customer 2">Vendor 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )
          }
          <InputWithLabel
            name="Add Address"
            id="address"
            onChange={() => { }}
            value={""}
          />
          <InputWithLabel
            name="Email"
            id="email"
            onChange={() => { }}
            value={""}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputWithLabel
              name="Phone"
              id="phone"
              onChange={() => { }}
              value={""}
            />
            <InputWithLabel
              name="PAN"
              id="pan"
              onChange={() => { }}
              value={""}
            />
          </div>
        </div>
        <div className="h-[1px] bg-neutral-300"></div>

        <div className="flex justify-end items-center gap-4 mt-auto">
          <DialogClose asChild>
            <Button onClick={() => { }} variant={"outline"}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={() => { }}>{type}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
