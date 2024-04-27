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
import { Button } from "@/components/ui/button";
import { Layers2, Fingerprint, Edit3 } from "lucide-react";
import InputWithLabel from "@/components/InputWithLabel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateEnterpriseUser } from "@/services/Enterprises_Users_Service/EnterprisesUsersService";
import { LocalStorageService } from "@/lib/utils";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";

const AddModal = ({
  type,
  cta,
  btnName,
  mutationFunc,
  userData,
  userId,
}) => {
  const queryClient = useQueryClient();
  const enterpriseId = LocalStorageService.get("enterprise_Id");
  const [open, setOpen] = useState(false);
  

  const [enterpriseData, setEnterPriseData] = useState(
    btnName !== "Edit"
      ? {
          enterprise_id: enterpriseId,
          name: "",
          address: "",
          country_code: "+91",
          mobile_number: "",
          email: "",
          pan_number: "",
          gst_number: "",
          user_type: cta,
        }
      : {
          enterprise_id: enterpriseId,
          name: userData.name,
          address: userData.address,
          country_code: "+91",
          mobile_number: userData.mobileNumber,
          email: userData.email,
          pan_number: userData.panNumber,
          gst_number: userData.gstNumber,
          user_type: cta,
        }
  );

  const [errorMsg, setErrorMsg] = useState("*Mandatory Information");

  const mutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success(
        cta == "client"
          ? "Client Added Successfully"
          : "Vendor Added Successfully"
      );
      setOpen((prev) => !prev);
      setEnterPriseData({
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
      queryClient.invalidateQueries({
        queryKey: [enterprise_user.getEnterpriseUsers.endpointKey],
      });
    },
    onError: (error) => {
      toast.error("Something went wrong");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => mutationFunc(data, userId),
    onSuccess: (data) => {
      if (!data.data.status) {
        // console.log(this.onError);
        this.onError();
        return;
      }

      toast.success("Edited Successfully");
      setOpen((prev) => !prev);
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
      if (btnName !== "Edit") {
        mutation.mutate(enterpriseData);
        return;
      }
      updateMutation.mutate(enterpriseData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {btnName === "Edit" ? (
          <div className="flex items-center justify-center rounded-sm  px-2 py-1.5 hover:cursor-pointer hover:bg-slate-100 gap-2 w-full">
            <Edit3 size={12} />
            Edit{" "}
          </div>
        ) : (
          <Button variant={"blue_outline"} size="sm">
            <Layers2 size={14} />
            {btnName}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{cta.toUpperCase()}</DialogTitle>

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

            <Button type="submit">{btnName === "Edit" ? "Edit" : type}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
