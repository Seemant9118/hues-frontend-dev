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
// import InputWithLabel from "./InputWithLabel";
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



const AddModal = ({ type, cta, onSubmit, modalHead }) => {
  const [modalData, setModalData] = useState({
    id: "",
    pass: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    pan: "",
    gst: "",
  });
  const [errorMsg, setErrorMsg] = useState('*Mandatory Information');


  const handleSubmit = (e) => {
    e.preventDefault();
    !errorMsg && onSubmit(modalData);
    setModalData({
      id: "",
      pass: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      pan: "",
      gst: "",
    });
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"blue_outline"} size="sm">
          {
            type === 'Save GST Credentials' ? <Fingerprint size={14} /> : <Layers2 size={14} />
          }
          {cta}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{modalHead}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">

            <span className="text-red-500">{errorMsg && errorMsg}</span>

            {
              type === "Save GST Credentials" ?
                <>
                  <InputWithLabel
                    name="Username"
                    type="text"
                    required={true}
                    id="id"
                    onChange={
                      (e) => {
                        setModalData((prev) => ({ ...prev, id: e.target.value }))
                        e.target.value === "" ? setErrorMsg('*Mandatory Information - username') : setErrorMsg('');
                      }}
                    value={modalData.id}
                  />
                  <InputWithLabel
                    name="Password"
                    type="password"
                    required={true}
                    id="id"
                    onChange={
                      (e) => {
                        setModalData((prev) => ({ ...prev, pass: e.target.value }))
                        e.target.value === "" ? setErrorMsg('*Mandatory Information - password') : setErrorMsg('');
                      }}
                    value={modalData.pass}
                  />
                  <div className="flex flex-col gap-4">
                    <Label className="flex-shrink-0">Available Agencies</Label>
                    <Select className="rounded">
                      <SelectTrigger className="gap-5">
                        <SelectValue placeholder="Select Agencies" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agency1">Agency 1</SelectItem>
                        <SelectItem value="agency2">Agency 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <InputWithLabel
                    name="Goods and Service Tax number"
                    type="tel"
                    id="gst"
                    required={true}
                    onChange={(e) => {
                      setModalData((prev) => ({ ...prev, gst: e.target.value }))
                      e.target.value === "" ? setErrorMsg('*Mandatory Information - GST No.') : setErrorMsg('');
                    }}
                    value={modalData.gst}
                  />
                </>
                :
                <>
                  <InputWithLabel
                    name="Name"
                    type="text"
                    required={true}
                    id="name"
                    onChange={
                      (e) => {
                        setModalData((prev) => ({ ...prev, name: e.target.value }))
                        e.target.value === "" ? setErrorMsg('*Please fill required details - Name') : setErrorMsg('');
                      }}
                    value={modalData.name}
                  />
                  <InputWithLabel
                    name="Address"
                    type="text"
                    id="address"
                    required={true}
                    onChange={(e) => setModalData((prev) => ({ ...prev, address: e.target.value }))}
                    value={modalData.address}
                  />
                  <InputWithLabel
                    name="Email"
                    type="email"
                    id="email"
                    required={true}
                    onChange={(e) => setModalData((prev) => ({ ...prev, email: e.target.value }))}
                    value={modalData.email}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputWithLabel
                      name="Phone"
                      type="tel"
                      id="phone"
                      required={true}
                      onChange={(e) => setModalData((prev) => ({ ...prev, phone: e.target.value }))}
                      value={modalData.phone}
                    />
                    <InputWithLabel
                      name="PAN"
                      type="tel"
                      id="pan"
                      required={true}
                      onChange={(e) => setModalData((prev) => ({ ...prev, pan: e.target.value }))}
                      value={modalData.pan}
                    />
                  </div>
                  <InputWithLabel
                    name="Goods and Service Tax number"
                    type="tel"
                    id="gst"
                    onChange={(e) => setModalData((prev) => ({ ...prev, gst: e.target.value }))}
                    value={modalData.gst}
                  />
                </>
            }
          </div>

          <div className="h-[1px] bg-neutral-300"></div>

          <div className="flex justify-end items-center gap-4 mt-3">
            <DialogClose asChild>
              <Button onClick={() => {
                setModalData({
                  id: "",
                  pass: "",
                  name: "",
                  address: "",
                  phone: "",
                  email: "",
                  pan: "",
                  gst: "",
                });
              }} variant={"outline"}>
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">{type === "Save GST Credentials" ? "Save" : type}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog >

  );
};

export default AddModal;
