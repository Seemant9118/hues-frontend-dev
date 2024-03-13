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
  const [errorMsg, setErrorMsg] = useState('*Please filled all required details before submit');


  const handleSubmit = (e) => {
    e.preventDefault();
    !errorMsg && onSubmit(modalData);
    setModalData({
      name: "",
      vendor: "",
      address: "",
      phone: "",
      email: "",
      pan: ""
    });
  }
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
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">

            <span className="text-red-500">{errorMsg && errorMsg}</span>

            <InputWithLabel
              name="Enter Name"
              required={true}
              id="name"
              onChange={(e) => {
                setModalData((prev) => ({ ...prev, name: e.target.value }))
                e.target.value === "" ? setErrorMsg('*Please filled required details - Name') : setErrorMsg('');
              }}
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
                    required={true}
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
              required={true}
              onChange={(e) => setModalData((prev) => ({ ...prev, address: e.target.value }))}
              value={modalData.address}
            />
            <InputWithLabel
              name="Email"
              id="email"
              required={true}
              onChange={(e) => setModalData((prev) => ({ ...prev, email: e.target.value }))}
              value={modalData.email}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputWithLabel
                name="Phone"
                id="phone"
                required={true}
                onChange={(e) => setModalData((prev) => ({ ...prev, phone: e.target.value }))}
                value={modalData.phone}
              />
              <InputWithLabel
                name="PAN"
                id="pan"
                required={true}

                onChange={(e) => setModalData((prev) => ({ ...prev, pan: e.target.value }))}
                value={modalData.pan}
              />
            </div>
          </div>
          <div className="h-[1px] bg-neutral-300"></div>

          <div className="flex justify-end items-center gap-4 mt-3">
            <DialogClose asChild>
              <Button onClick={() => {
                setModalData({
                  name: "",
                  vendor: "",
                  address: "",
                  phone: "",
                  email: "",
                  pan: ""
                });
              }} variant={"outline"}>
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">{type}</Button>

          </div>
        </form>
      </DialogContent>
    </Dialog>

  );
};

export default AddModal;
