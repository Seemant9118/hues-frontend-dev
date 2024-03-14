"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalStorageService } from "@/lib/utils";
import { Phone, CreditCard, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Tooltips from "@/components/Tooltips";


import "react-datepicker/dist/react-datepicker.css";

export default function ProfileDetailForm({ params, isThirdPartyLogin }) {
  const router = useRouter();
  const query = useSearchParams();
  const login = (e) => {
    e.preventDefault();
    const redirectPath = query.get("redirect") || "/"; // Default to the homepage if no redirect path is provided
    toast.success("Login Successfull.");
    LocalStorageService.set("token", "123");
    router.push(redirectPath);
  };

  return (
    <form
      onSubmit={login}
      className="border border-[#E1E4ED] p-10 px-5 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md"
    >
      <h1 className="w-full text-2xl text-[#414656] font-bold text-center">
        Please Complete Your Profile
      </h1>
      <p className="w-full text-xl text-[#414656] text-center">
        One account for all things <span className="font-bold">Hues</span>
      </p>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="mobile-number" className="text-[#414656] font-medium flex items-center gap-1">
          PAN Details <span className="text-red-600">*</span>  <Tooltips content="PAN Details necessary to your profile" />
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
            Mobile Number  <span className="text-red-600">*</span> <Tooltips content="Mobile number necessary to your profile" />
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
          Date of Birth <span className="text-red-600">*</span> <Tooltips content="DOB necessary to your profile" />
        </Label>
        <Input required={true} className="focus:font-bold flex flex-col px-2 text-[#3F5575]" type="date" />
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email" className="text-[#414656] font-medium flex items-center gap-1">
          Email Address <span className="text-red-600">*</span> <Tooltips content="Email ID necessary to your profile" />
        </Label>
        <div className="relative">
          <Input
            required={true}
            className="focus:font-bold"
            type="email"
            placeholder="patrick@gmail.com*"
          />
          <span className="text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2">
            @
          </span>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Submit Details
      </Button>
    </form>
  );
};
