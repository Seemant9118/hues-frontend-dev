"use client";
import { enterprise_user } from "@/api/enterprises_user/Enterprises_users";
import InputWithLabel from "@/components/ui/InputWithLabel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LocalStorageService } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit3, Layers2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ErrorBox from "../ui/ErrorBox";
import EmptyStageComponent from "../ui/EmptyStageComponent";

const AddModal = ({ type, cta, btnName, mutationFunc, userData, userId }) => {
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
  const [errorMsg, setErrorMsg] = useState({});

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
      toast.error(error.response.data.message || "Something went wrong");
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
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  // validation
  const validation = (enterpriseData) => {
    let error = {};
    const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const pan_pattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (enterpriseData.name === "") {
      error.name = "*Required Name";
    }

    if (enterpriseData.address === "") {
      error.address = "*Required Address";
    }

    if (enterpriseData.mobile_number === "") {
      error.mobile_number = "*Required Phone";
    } else if (enterpriseData.mobile_number.length !== 10) {
      error.mobile_number = "*Please enter a valid mobile number";
    }

    if (enterpriseData.email === "") {
      error.email = "*Required Email";
    } else if (!email_pattern.test(enterpriseData.email)) {
      error.email = "*Please provide valid email";
    }

    if (enterpriseData.pan_number === "") {
      error.pan_number = "*Required PAN";
    } else if (!pan_pattern.test(enterpriseData.pan_number)) {
      error.pan_number = "* Please provide valid PAN Number";
    }

    if (enterpriseData.gst_number === "") {
      error.gst_number = "*Required GST IN";
    }

    return error;
  };

  const handleEditSubmit = (e) => {
    console.log("handleEditSubmit");
    e.preventDefault();
    const isError = validation(enterpriseData);

    if (Object.keys(isError).length === 0) {
      updateMutation.mutate(enterpriseData);
      setErrorMsg({});
      return;
    }
    setErrorMsg(isError);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseData);

    if (Object.keys(isError).length === 0) {
      mutation.mutate(enterpriseData);
      setErrorMsg({});
      return;
    }
    setErrorMsg(isError);
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
          <Button variant={"blue_outline"} className="w-full">
            <Layers2 size={14} />
            {btnName}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{cta.toUpperCase()}</DialogTitle>

        {/* {enterpriseId && ( */}
          <form onSubmit={btnName === "Edit" ? handleEditSubmit : handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
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
                {errorMsg.name && <ErrorBox msg={errorMsg.name} />}
              </div>
              <div className="flex flex-col gap-1">
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
                {errorMsg.address && <ErrorBox msg={errorMsg.address} />}
              </div>
              <div className="flex flex-col gap-1">
                <InputWithLabel
                  name="Email"
                  type="text"
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
                {errorMsg.email && <ErrorBox msg={errorMsg.email} />}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
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
                  {errorMsg.mobile_number && (
                    <ErrorBox msg={errorMsg.mobile_number} />
                  )}
                </div>
                <div className="flex flex-col gap-1">
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
                  {errorMsg.pan_number && (
                    <ErrorBox msg={errorMsg.pan_number} />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <InputWithLabel
                  name="GST IN"
                  type="tel"
                  id="gst_number"
                  required={true}
                  onChange={(e) =>
                    setEnterPriseData((prev) => ({
                      ...prev,
                      gst_number: e.target.value,
                    }))
                  }
                  value={enterpriseData.gst_number}
                />
                {errorMsg.gst_number && <ErrorBox msg={errorMsg.gst_number} />}
              </div>
            </div>

            <div className="h-[1px] bg-neutral-300"></div>

            <div className="flex justify-end items-center gap-4 mt-3">
              <DialogClose asChild>
                <Button
                  onClick={() => {
                    setErrorMsg({});
                    if (btnName !== "Edit") {
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
                    }
                    setOpen(false);
                  }}
                  variant={"outline"}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit">
                {btnName === "Edit" ? "Edit" : type}
              </Button>
            </div>
          </form>
        {/* )} */}
{/* 
        {!enterpriseId && (
          <div className="flex flex-col justify-center">
            <EmptyStageComponent heading="Please Complete Your Onboarding to Create Enterprise" />
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        )} */}
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;
