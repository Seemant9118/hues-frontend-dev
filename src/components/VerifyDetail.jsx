"use client";
import React, { useState } from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { AtSign, CalendarDays, Contact, CreditCard, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import DatePickers from "@/components/DatePickers";
import moment from "moment";

const VerifyDetail = () => {
    
  const [date, setDate] = useState(moment(new Date()).format("DD-MM-YYYY"));
  return (
    <section className="px-10">
      <h1 className="text-2xl leading-8 pb-4 font-bold text-[#121212]">
        Please Verify Correct Details to Continue
      </h1>
      <div className=" grid grid-cols-[1fr,1fr] gap-5">
        {/* form1 */}
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
                value=""
                onChange=""
              />
              <Contact className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Mobile_Number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Mobile Number
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="+91 7123567820"
                name="mobile_number"
                value=""
                onChange=""
              />
              <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="dob"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Date of Birth
            </Label>

            <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <DatePickers
                selected={date}
                onChange={(date) => setDate(moment(date).format("DD-MM-YYYY"))}
              />
              <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="email"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Email Address
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="email"
                placeholder="patrick@gmail.com"
                name="email"
                value=""
                onChange=""
              />
              <AtSign className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <Button className="w-full max-w-sm mt-8">Submit to Continue</Button>
        </form>
        {/* form1 */}
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
                value=""
                onChange=""
              />
              <Contact className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="Mobile_Number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Mobile Number
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="text"
                placeholder="+91 7123567820"
                name="mobile_number"
                value=""
                onChange=""
              />
              <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="dob"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Date of Birth
            </Label>

            <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <DatePickers
                selected={date}
                onChange={(date) => setDate(moment(date).format("DD-MM-YYYY"))}
              />
              <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
            </div>
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="email"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Email Address
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="email"
                placeholder="patrick@gmail.com"
                name="email"
                value=""
                onChange=""
              />
              <AtSign className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
          <Button variant="grey" className="w-full max-w-sm mt-8 ">
            Submit to Continue
          </Button>
        </form>
      </div>
    </section>
  );
};

export default VerifyDetail;
