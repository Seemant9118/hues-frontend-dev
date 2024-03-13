"use client";
import React, { useState } from "react";
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
import { Layers2, Fingerprint } from "lucide-react";

import InputWithLabel from "@/components/InputWithLabel";
import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";


const AddModal = ({ type, onSubmit }) => {
  const [modalData, setModalData] = useState({
    name: "",
    vendor: "",
    address: "",
    phone: "",
    email: "",
    pan: ""
  });

  // console.log(modalData);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"blue_outline"} size="sm">
          {
            type === 'Save GST Credentials' ? <Fingerprint size={14} /> : <Layers2 size={14} />
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
            onChange={(e) => setModalData((prev) => ({ ...prev, name: e.target.value }))}
            value={modalData.name}
          />
          {
            type === 'Add Client' && (
              <div className="flex flex-col gap-1">
                <Label>Select Vendor</Label>
                <Select
                  value={modalData.vendor}
                  onValueChange={(value) =>
                    setModalData((prev) => ({ ...prev, vendor: value }))
                  }
                >
                  <SelectTrigger className="w-full rounded">
                    <SelectValue placeholder="Select Vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vendor 1">Vendor 1</SelectItem>
                    <SelectItem value="Vendor 2">Vendor 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )
          }
          <InputWithLabel
            name="Add Address"
            id="address"
            onChange={(e) => setModalData((prev) => ({ ...prev, address: e.target.value }))}
            value={modalData.address}
          />
          <InputWithLabel
            name="Email"
            id="email"
            onChange={(e) => setModalData((prev) => ({ ...prev, email: e.target.value }))}
            value={modalData.email}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputWithLabel
              name="Phone"
              id="phone"
              onChange={(e) => setModalData((prev) => ({ ...prev, phone: e.target.value }))}
              value={modalData.phone}
            />
            <InputWithLabel
              name="PAN"
              id="pan"
              onChange={(e) => setModalData((prev) => ({ ...prev, pan: e.target.value }))}
              value={modalData.pan}
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
          <DialogClose>
            <Button onClick={() => {onSubmit(modalData); setModalData(''); }}>{type}</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
