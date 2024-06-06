'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-dropdown-menu';
import { AtSign, CalendarDays, Contact, CreditCardIcon } from 'lucide-react';
import React from 'react';

const VerifyDetail = ({ submittedDetails, kycDetails }) => {
  return (
    <section className="px-10">
      <h1 className="pb-4 text-2xl font-bold leading-8 text-[#121212]">
        Please Verify Correct Details to Continue
      </h1>
      <div className="grid grid-cols-[1fr,1fr] gap-5">
        {/* form1 Submitted details */}
        <form className="scrollBarStyles flex h-[75vh] flex-col items-center justify-center gap-5 overflow-y-auto rounded-xl bg-white px-4 pb-4 shadow-[0_4px_6px_0_#3288ED1A]">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Name"
              className="flex items-center gap-1 font-medium text-[#414656]"
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
              <Contact className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Aadhaar_number"
              className="flex items-center gap-1 font-medium text-[#414656]"
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
              <AtSign className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="flex items-center gap-1 font-medium text-[#414656]"
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
              <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="flex items-center gap-1 font-medium text-[#414656]"
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

              <CreditCardIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>
          <Button className="mt-8 w-full max-w-sm">Continue</Button>
        </form>

        {/* form2 - KYC fetched details */}
        <form className="scrollBarStyles flex h-[75vh] flex-col items-center justify-center gap-5 overflow-y-auto rounded-xl bg-white px-4 pb-4 shadow-[0_4px_6px_0_#3288ED1A]">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Name"
              className="flex items-center gap-1 font-medium text-[#414656]"
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
              <Contact className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Aadhaar_number"
              className="flex items-center gap-1 font-medium text-[#414656]"
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
              <AtSign className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="flex items-center gap-1 font-medium text-[#414656]"
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
              <CalendarDays className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>

          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="pan_number"
              className="flex items-center gap-1 font-medium text-[#414656]"
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

              <CreditCardIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
          </div>
          <Button
            className="mt-8 w-full max-w-sm"
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
