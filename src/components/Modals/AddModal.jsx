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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateEnterpriseUser } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { LocalStorageService } from "@/lib/utils";

const AddModal = ({ type, cta, modalHead, onSubmit, btnName }) => {
  const enterpriseId = LocalStorageService.get("enterprise_Id");

  const [open, setOpen] = useState(false);
  const [gstCredential, setGstCredentials] = useState({
    agency: "",
    user_id: "",
    password: "",
  });
  const [enterpriseData, setEnterPriseData] = useState({
    enterprise_id: enterpriseId,
    name: "",
    address: "",
    country_code: "+91",
    mobile_number: "",
    email: "",
    pan_number: "",
    gst_number: "",
    user_type: cta,
  });
  const [errorMsg, setErrorMsg] = useState("*Mandatory Information");
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (data) => CreateEnterpriseUser(data),
    onSuccess: () => {
      toast.success(
        cta == "client"
          ? "Client Added Successfully"
          : "Vendor Added Successfully"
      );
      setEnterPriseData({
        enterprise_id: "",
        name: "",
        address: "",
        country_code: "",
        mobile_number: "",
        email: "",
        pan_number: "",
        gst_number: "",
        user_type: "",
      });

      setOpen(false);
      queryClient.invalidateQueries({
        queryKey: [enterprise_user.getEnterpriseUsers.endpointKey],
      });
    },
    onError: (error) => {
      toast.error("Something went wrong");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!errorMsg) {
      mutation.mutate(enterpriseData);
    }
  };

  // handle submit function for password manager modal
  const handleSubmitGstCredentials = (e) => {
    e.preventDefault();
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
          {type === "Save GST Credentials" ? (
            <Fingerprint size={14} />
          ) : (
            <Layers2 size={14} />
          )}
          {btnName}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{cta ? cta.toUpperCase() : modalHead}</DialogTitle>
        {type !== "Save GST Credentials" && (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <span className="text-red-500">{errorMsg && errorMsg}</span>
              <InputWithLabel
                name="Name"
                type="text"
                required={true}
                id="name"
                onChange={(e) => {
                  setEnterPriseData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                  e.target.value === ""
                    ? setErrorMsg("*Please fill required details - Name")
                    : setErrorMsg("");
                }}
                value={enterpriseData.name}
              />
              <InputWithLabel
                name="Address"
                type="text"
                id="address"
                required={true}
                onChange={(e) =>
                  setEnterPriseData((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                value={enterpriseData.address}
              />
              <InputWithLabel
                name="Email"
                type="email"
                id="email"
                required={true}
                onChange={(e) =>
                  setEnterPriseData((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                value={enterpriseData.email}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputWithLabel
                  name="Phone"
                  type="tel"
                  id="mobile_number"
                  required={true}
                  onChange={(e) =>
                    setEnterPriseData((prev) => ({
                      ...prev,
                      mobile_number: e.target.value,
                    }))
                  }
                  value={enterpriseData.mobile_number}
                />
                <InputWithLabel
                  name="PAN"
                  type="tel"
                  id="pan_number"
                  required={true}
                  onChange={(e) =>
                    setEnterPriseData((prev) => ({
                      ...prev,
                      pan_number: e.target.value,
                    }))
                  }
                  value={enterpriseData.pan_number}
                />
              </div>
              <InputWithLabel
                name="Goods and Service Tax number"
                type="tel"
                id="gst_number"
                onChange={(e) =>
                  setEnterPriseData((prev) => ({
                    ...prev,
                    gst_number: e.target.value,
                  }))
                }
                value={enterpriseData.gst_number}
              />
            </div>

            <div className="h-[1px] bg-neutral-300"></div>

            <div className="flex justify-end items-center gap-4 mt-3">
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setEnterPriseData({
                      enterprise_id: "",
                      name: "",
                      address: "",
                      country_code: "",
                      mobile_number: "",
                      email: "",
                      pan_number: "",
                      gst_number: "",
                      user_type: "",
                    });
                    setOpen((prev) => !prev);
                  }}
                  variant={"outline"}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit">
                {type === "Save GST Credentials" ? "Save" : type}
              </Button>
            </div>
          </form>
        )}

        {type === "Save GST Credentials" && (
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

              <Button type="submit">
                {type === "Save GST Credentials" ? "Save" : type}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
