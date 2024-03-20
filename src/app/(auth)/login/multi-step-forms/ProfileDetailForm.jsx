"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalStorageService } from "@/lib/utils";
import DatePickers from '@/components/DatePickers';
import { Phone, CreditCard, CalendarDays } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Tooltips from "@/components/Tooltips";

export default function ProfileDetailForm({ params, isThirdPartyLogin }) {
  const router = useRouter();
  const query = useSearchParams();
  const login = (e) => {
    e.preventDefault();
    const redirectPath = query.get("redirect") || "/"; // Default to the homepage if no redirect path is provided
    toast.success("Welcome to Hues! Login successful.");
    LocalStorageService.set("token", "123");
    router.push(redirectPath);
  };

  return (
    <form
      onSubmit={login}
      className="border border-[#E1E4ED] p-10 px-5 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md"
    >
      <h1 className="w-full text-2xl text-[#414656] font-bold text-center">
        Complete Your Profile: Unlock Hues
      </h1>
      <p className="w-full text-xl text-[#414656] text-center">
        One account for all things <span className="font-bold">Hues</span>
      </p>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="mobile-number" className="text-[#414656] font-medium flex items-center gap-1">
          Permanent Account Number <span className="text-red-600">*</span>  <Tooltips content="PAN: Your universal legal identifier for all government and financial interactions on Hues." />
        </Label>
        <div className="relative">
          <Input
            required={true}
            className="focus:font-bold"
            type="text"
            placeholder="FGHJ1456T"
          />
          <CreditCard className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
        </div>
      </div>

      {isThirdPartyLogin && (
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
      )}
      {!isThirdPartyLogin && (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="mobile-number" className="text-[#414656] font-medium flex items-center gap-1">
            Aadhaar Number <span className="text-red-600">*</span> <Tooltips content="Aadhaar necessary to your profile" />
          </Label>
          <div className="relative">
            <Input
              required={true}
              className="focus:font-bold"
              type="text"
              placeholder="1111-1111-1111"
            />
            <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
        </div>
      )}

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="dob" className="text-[#414656] font-medium flex items-center gap-1">
          Date of Birth <span className="text-red-600">*</span> <Tooltips content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience." />
        </Label>

        <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <DatePickers />
          <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
        </div>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email" className="text-[#414656] font-medium flex items-center gap-1">
          Email Address <span className="text-red-600">*</span> <Tooltips content="Your email: The gateway to important Hues communications and document deliveries." />
        </Label>
        <div className="relative">
          <Input
            required={true}
            className="focus:font-bold"
            type="email"
            placeholder="patrick@gmail.com*"
          />
          <span className="text-[#3F5575] text-xl font-bold absolute top-1/2 right-2 -translate-y-1/2">
            @
          </span>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};
