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
import { Layers2, Fingerprint, Edit3 } from "lucide-react";
import InputWithLabel from "@/components/InputWithLabel";

const AddCredentialsModal = ({ type, modalHead, btnName }) => {
  const [open, setOpen] = useState(false);
  const [gstCredential, setGstCredentials] = useState({
    agency: "",
    user_id: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState("*Mandatory Information");

  // handle submit function for password manager modal
  const handleSubmitGstCredentials = (e) => {
    e.preventDefault();
    console.log(gstCredential)
    setGstCredentials({
      agency: "",
      user_id: "",
      password: "",
    });
    setOpen((prev) => !prev);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={"blue_outline"} size="sm">
          <Fingerprint size={14} />
          {btnName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{modalHead}</DialogTitle>
        <form onSubmit={handleSubmitGstCredentials}>
          <div className="flex flex-col gap-4">
            <span className="text-red-500">{errorMsg && errorMsg}</span>

            <div className="flex flex-col gap-4">
              <Label className="flex-shrink-0">Agency</Label>
              <Select className="rounded">
                <SelectTrigger className="gap-5">
                  <SelectValue placeholder="Select Agency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agency1">GST</SelectItem>
                  {/* <SelectItem value="agency2">Agency 2</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <InputWithLabel
              name="Username"
              type="text"
              required={true}
              onChange={(e) => {
                setGstCredentials((prev) => ({
                  ...prev,
                  user_id: e.target.value,
                }));
                e.target.value === ""
                  ? setErrorMsg("*Mandatory Information - username")
                  : setErrorMsg("");
              }}
              value={gstCredential.user_id}
            />
            <InputWithLabel
              name="Password"
              type="password"
              required={true}
              onChange={(e) => {
                setGstCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }));
                e.target.value === ""
                  ? setErrorMsg("*Mandatory Information - password")
                  : setErrorMsg("");
              }}
              value={gstCredential.pass}
            />
          </div>

          <div className="h-[1px] bg-neutral-300"></div>

          <div className="flex justify-end items-center gap-4 mt-3">
            <DialogClose asChild>
              <Button
                onClick={() => {
                  setOpen((prev) => !prev);
                }}
                variant={"outline"}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCredentialsModal;
