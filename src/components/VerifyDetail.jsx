"use client";
import React, { useState } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AtSign,
  CalendarDays,
  Contact,
  CreditCard,
  CreditCardIcon,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePickers from "@/components/DatePickers";
import moment from "moment";

const VerifyDetail = ({ submittedDetails, kycDetails }) => {
  return (
    <section className="px-10">
      <h1 className="text-2xl leading-8 pb-4 font-bold text-[#121212]">
        Please Verify Correct Details to Continue
      </h1>
      <div className=" grid grid-cols-[1fr,1fr] gap-5">
        {/* form1 Submitted details*/}
        <form className="h-[75vh] bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] px-4 pb-4 overflow-y-auto flex flex-col justify-center items-center gap-5 scrollBarStyles">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Name"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Name
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="Name"
                name="name"
                value={submittedDetails.name}
                disabled
              />
              <Contact className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Aadhaar_number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Aadhar Number
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="xxxxxxxx4563"
                name="aadharNumber"
                value={submittedDetails.aadharNumber}
                disabled
              />
              <AtSign className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Date of Birth
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="FFTH456T"
                name="dob"
                disabled
                value={submittedDetails.dob}
                onChange=""
              />
              <CalendarDays className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              PAN Number
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="FFTH456T"
                name="panNumber"
                value={submittedDetails.panNumber}
                disabled
              />

              <CreditCardIcon className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <Button className="w-full max-w-sm mt-8">Continue</Button>
        </form>

        {/* form2 - KYC fetched details */}
        <form className="h-[75vh] bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] px-4 pb-4 overflow-y-auto flex flex-col justify-center items-center gap-5 scrollBarStyles">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Name"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Name
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="Name"
                name="name"
                disabled
                value={kycDetails.name}
              />
              <Contact className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Aadhaar_number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Aadhar Number
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="xxxxxxxx4563"
                name="aadharNumber"
                disabled
                value={kycDetails.aadharNumber}
                onChange=""
              />
              <AtSign className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Date of Birth
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="FFTH456T"
                name="dob"
                disabled
                value={kycDetails.dob}
                onChange=""
              />
              <CalendarDays className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              PAN Number
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="FFTH456T"
                name="panNumber"
                disabled
                value={kycDetails.panNumber}
                onChange=""
              />

              <CreditCardIcon className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <Button
            className="w-full max-w-sm mt-8"
            variant="grey"
            disabled={true}
          >
            Your KYC Details
          </Button>
        </form>
      </div>
    </section>
  );
};

export default VerifyDetail;
