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
import { client_enterprise } from "@/api/enterprises_user/client_enterprise/client_enterprise";
import { vendor_enterprise } from "@/api/enterprises_user/vendor_enterprise/vendor_enterprise";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import Loading from "../ui/Loading";

const AddModal = ({ type, cta, btnName, mutationFunc, userData, id }) => {
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
        queryKey:
          cta == "client"
            ? [client_enterprise.getClients.endpointKey]
            : [vendor_enterprise.getVendors.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => mutationFunc(id, data),
    onSuccess: (data) => {
      if (!data.data.status) {
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
        queryKey:
          cta == "client"
            ? [client_enterprise.getClients.endpointKey]
            : [vendor_enterprise.getVendors.endpointKey],
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

  const [searchInput, setSearchInput] = useState({
    id_type: "",
    id_number: "",
  });

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

        {/* search inputs */}
        {/* <form>
          <div className="flex justify-center items-center gap-4">
            <div className="flex flex-col gap-0.5 w-1/2">
              <div>
                <Label className="flex-shrink-0">Identifier Type</Label>{" "}
                <span className="text-red-600">*</span>
              </div>
              <Select
                required
                value={searchInput.id_type}
                onValueChange={(value) =>
                  setSearchInput((prev) => ({ ...prev, id_type: value }))
                }
              >
                <SelectTrigger className="max-w-xs gap-5">
                  <SelectValue placeholder="Select Identifier Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gst">GST</SelectItem>
                  <SelectItem value="pan">PAN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1 w-1/2">
              <InputWithLabel
                className="rounded-md"
                name={"Identifier No. " + searchInput?.id_type?.toUpperCase()}
                type="tel"
                id="id"
                required={true}
                value={searchInput.id_number}
                onChange={(value) =>
                  setSearchInput((prev) => ({ ...prev, id_number: value }))
                }
              />
            </div>
          </div>
        </form> */}

        {/* <div className="h-[1px] bg-neutral-300"></div> */}

        {/* client list related search  */}
        {/* <div className="max-h-[200px] border rounded-md p-4 flex flex-col gap-4 overflow-auto scrollBarStyles">
          <div className="flex justify-between font-bold text-xs items-center border rounded-md p-2 bg-gray-100">
            <div className="flex flex-col gap-1 text-gray-600">
              <p>+91 1234567890</p>
              <p>dummy@gmail.com</p>
              <p>QWERT1234H</p>
            </div>
            <Button>Add</Button>
          </div>

          <div className="flex justify-between font-bold text-xs items-center border rounded-md p-2 bg-gray-100">
            <div className="flex flex-col gap-1 text-gray-600">
              <p>+91 1234567890</p>
              <p>dummy@gmail.com</p>
              <p>QWERT1234H</p>
            </div>
            <Button>Add</Button>
          </div>
        </div> */}

        {/* if client does not in our client list then, create client */}
        <form
          // className="border p-5 rounded-md"
          onSubmit={btnName === "Edit" ? handleEditSubmit : handleSubmit}
        >
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
                {errorMsg.pan_number && <ErrorBox msg={errorMsg.pan_number} />}
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
                    setSearchInput({});
                  }
                  setOpen(false);
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
