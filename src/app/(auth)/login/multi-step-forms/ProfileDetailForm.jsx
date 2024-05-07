"use client";
import DatePickers from "@/components/DatePickers";
import Tooltips from "@/components/Tooltips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalStorageService } from "@/lib/utils";
import { userUpdate } from "@/services/User_Auth_Service/UserAuthServices";
import { useMutation } from "@tanstack/react-query";
import { CalendarDays, CreditCard, Info, Phone, UserRound } from "lucide-react";
import moment from "moment";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import Loading from "@/components/Loading";
import ErrorBox from "@/components/ErrorBox";

export default function ProfileDetailForm({
  setCurrStep,
  params,
  isThirdPartyLogin,
}) {
  const userId = LocalStorageService.get("user_profile");

  const [date, setDate] = useState(moment(new Date()).format("DD-MM-YYYY"));
  const [userData, setUserData] = useState({
    user_id: userId,
    name: "",
    email: "",
    aadhaar_number: "",
    date_of_birth: date.toString(),
    pan_number: "",
  });

  const [errorMsg, setErrorMsg] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
      toast.success("Your Profile Completed!");
      LocalStorageService.set(
        "enterprise_Id",
        data.data.data.user.enterpriseId
      );
      setCurrStep(4);
    },
    onError: (error) => {
      toast.error("Oops, Something went wrong!");
    },
  });

  const validation = (userData) => {
    let error = {};
    const email_pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const pan_pattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    // name validation
    if (userData.name === "") {
      error.name = "*Required Full Name";
    }

    // pan validation
    if (userData.pan_number === "") {
      error.pan_number = "*Required PAN Number";
    } else if (!pan_pattern.test(userData.pan_number)) {
      error.pan_number = "* Please write valid PAN Number";
    }

    // Aadhaar validation
    if (userData.aadhaar_number === "") {
      error.aadhaar_number = "* Required Aadhaar Number";
    } else if (userData.aadhaar_number.length !== 12) {
      error.aadhaar_number = "* Please enter a valid 12-digit Aadhar Number";
    }

    // date_of_birth validation
    if (userData.date_of_birth === "") {
      error.date_of_birth = "*Required Date of Birth";
    }

    // email validation
    if (userData.email === "") {
      error.email = "*Required Email";
    } else if (!email_pattern.test(userData.email)) {
      error.email = "*Email is not corrected format";
    }

    return error;
  };

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    if (name === "pan_number") {
      const pan_pattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!pan_pattern.test(value)) {
        // Reset error message if PAN is valid
        setErrorMsg({
          ...errorMsg,
          pan_number: "",
        });
        setUserData((values) => ({ ...values, [name]: value.toUpperCase() }));
      } else {
        // Set error message if PAN is invalid
        setErrorMsg({
          ...errorMsg,
          pan_number: "*Please write valid PAN",
        });
      }
      return;
    }

    // aadhaar_number with masked 'x' value
    if (name === "aadhaar_number") {
      const maskedValue = "xxxxxxxx";
      if (value.length <= 8) {
        const newValue = maskedValue.slice(0, value.length);
        setUserData((values) => ({ ...values, [name]: newValue }));
      } else {
        const newValue = maskedValue.slice(0, value.length) + value.slice(8);
        setUserData((values) => ({ ...values, [name]: newValue }));
      }
      return;
    }

    setUserData((values) => ({ ...values, [name]: value }));
  };

  const login = (e) => {
    e.preventDefault();
    const isAnyError = validation(userData);

    if (Object.keys(isAnyError).length === 0) {
      mutation.mutate(userData);
    }
    setErrorMsg(isAnyError);
  };

  return (
    <>
      <form
        onSubmit={login}
        className="border border-[#E1E4ED] py-10 px-5 flex flex-col justify-center items-center gap-3 min-h-[500px] w-[450px] bg-white z-20 rounded-md"
      >
        <h1 className="w-full text-2xl text-[#414656] font-bold text-center">
          Complete your profile: unlock Hues
        </h1>
        {/* <p className="w-full text-xl text-[#414656] text-center">
          One account for all things <span className="font-bold">Hues</span>
        </p> */}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="text-[#414656] font-medium flex items-center gap-1"
          >
            Full Name <span className="text-red-600">*</span>{" "}
            <Tooltips trigger={<Info size={12} />} content="Your full Name" />
          </Label>

          <div className="relative">
            <Input
              // required={true}
              className="focus:font-bold"
              type="text"
              placeholder="Full Name"
              name="name"
              value={userData.name}
              onChange={handleChange}
            />
            <UserRound className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
          {errorMsg?.name && (
            <p className="text-red-600 text-xs font-semibold">
              {errorMsg?.name}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="text-[#414656] font-medium flex items-center gap-1"
          >
            Permanent Account Number <span className="text-red-600">*</span>{" "}
            <Tooltips
              trigger={<Info size={12} />}
              content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
            />
          </Label>
          <div className="relative">
            <Input
              // required={true}
              className="focus:font-bold"
              type="text"
              placeholder="FGHJ1456T"
              name="pan_number"
              value={userData.pan_number}
              onChange={handleChange}
            />
            <CreditCard className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
          {errorMsg?.pan_number && (
            <p className="text-red-600 text-xs font-semibold">
              {errorMsg?.pan_number}
            </p>
          )}
        </div>

        {/* {isThirdPartyLogin && (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="mobile-number" className="text-[#414656] font-medium flex items-center gap-1">
              Mobile Number  <span className="text-red-600">*</span> <Tooltips content="Mobile number: For OTP delivery, ensuring secure authentication and consent on Hues." />
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="tel"
                placeholder="+91 987654321"
              />
              <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
        )} */}
        {!isThirdPartyLogin && (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="mobile-number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Aadhaar Number <span className="text-red-600 ">*</span>{" "}
              <Tooltips
                trigger={<Info size={12} />}
                content="Aadhaar necessary to your profile"
              />
            </Label>
            <div className="relative">
              <Input
                // required={true}
                className="focus:font-bold"
                type="text"
                placeholder="1111-1111-1111"
                name="aadhaar_number"
                value={userData.aadhaar_number}
                onChange={handleChange}
              />
              <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
            {errorMsg?.aadhaar_number && (
              <p className="text-red-600 text-xs font-semibold">
                {errorMsg?.aadhaar_number}
              </p>
            )}
          </div>
        )}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="dob"
            className="text-[#414656] font-medium flex items-center gap-1"
          >
            Date of Birth <span className="text-red-600">*</span>{" "}
            <Tooltips
              trigger={<Info size={12} />}
              content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
            />
          </Label>

          <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <DatePickers
              selected={date}
              onChange={(date) => setDate(moment(date).format("DD-MM-YYYY"))}
            />
            <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
          </div>
          {errorMsg?.date_of_birth && (
            <p className="text-red-600 text-xs font-semibold">
              {errorMsg?.date_of_birth}
            </p>
          )}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="email"
            className="text-[#414656] font-medium flex items-center gap-1"
          >
            Email Address <span className="text-red-600">*</span>{" "}
            <Tooltips
              trigger={<Info size={12} />}
              content="Your email: The gateway to important Hues communications and document deliveries."
            />
          </Label>
          <div className="relative">
            <Input
              // required={true}
              className="focus:font-bold"
              type="text"
              placeholder="patrick@gmail.com*"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
            <span className="text-[#3F5575] text-xl font-bold absolute top-1/2 right-2 -translate-y-1/2">
              @
            </span>
          </div>
          {errorMsg?.email && (
            <p className="text-red-600 text-xs font-semibold">
              {errorMsg?.email}
            </p>
          )}
        </div>
        <Button type="submit" className="w-full">
          {mutation.isPending ? <Loading /> : "Submit"}
        </Button>
      </form>

      {/* <div className="border">
        {isOnboardingdone && (
          <div className=" bg-white h-[300px] w-[600px] flex flex-col justify-center items-center gap-5 relative">
            <div className="absolute right-2 top-2 cursor-pointer" onClick={handleOnboardingEvent}><X /></div>
            <div className="rounded-full text-white bg-green-500 flex items-center justify-center p-2 max-w-fit">
              <Check />
            </div>
            <h1 className="text-4xl text-blue-500">Congratulations</h1>
            <p className="text-lg text-[#414656] ">You are Succcessfully Complete Your Profile</p>
          </div>
        )}
      </div> */}
    </>
  );
}
