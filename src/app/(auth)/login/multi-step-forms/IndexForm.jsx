"use client";
import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IndexForm({ setCurrStep }) {
  const [loginWithThirdParty, setLoginWithThirdParty] = useState(true); // digilocker (thirdParty) by default active
  const [formDataWithDigi, setFormDataWithDigi] = useState({});


  const handleSwitchLoginMethod = () => {
    setLoginWithThirdParty(!loginWithThirdParty);
  };

  const handleChange = (e) => {
    let name = e.name;
    let value = e.value;
    setFormDataWithDigi(values => ({ ...values, [name]: value }));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formDataWithDigi);
    setCurrStep(3)
  }

  return (
    <div className="border border-[#E1E4ED] p-10 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md">
      <h1 className="w-full text-3xl text-[#414656] font-bold text-center">
        Welcome to HuesERP!
      </h1>
      <p className="w-full text-xl text-[#414656] text-center">
        One account for all things <span className="font-bold">Hues</span>
      </p>
      {loginWithThirdParty ? (

        <form onSubmit={handleSubmit} className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="adhar-number"
            className="text-[#414656] font-medium"
          >
            Adhar Number*
          </Label>
          <div className="hover:border-gray-600 flex items-center gap-1 relative">
            <Input className="focus:font-bold" type="tel" placeholder="Adhar Number*" name="adharNumber" onChange={handleChange} value={formDataWithDigi.name } required />
            <span className="text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2">@</span>
          </div>
          <Button variant="outline" className="w-full text-[#5532E8] font-bold border-[#5532E8] hover:text-[#5532E8] rounded">
            <Image src={"/digi-icon.png"} width={25} height={20} />
            Login with Digilocker
          </Button>
        </form>


      ) : (

        <form onSubmit={(e) => {
          e.preventDefault()
          setCurrStep(2)
        }} className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="text-[#414656] font-medium"
          >
            Mobile Number*
          </Label>
          <div className="hover:border-gray-600 flex items-center gap-1 relative">
            <Input type="tel" name="phoneNumber" placeholder="Phone Number" className="focus:font-bold" required />
            <Phone className=" text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
          <Button
            className="w-full rounded font-bold text-white hover:cursor-pointer"
            onClick={() => setCurrStep(2)}
          >
            <Image src={"/smartphone.png"} width={15} height={5} />
            Login with Mobile
          </Button>
        </form>
      )}

      {/* signup redirection */}
      <div className="w-full py-2 px-4 flex justify-center gap-1 font-bold text-[#414656]">
        Not a Hues subscriber yet?{" "}
        <span className="text-[#288AF9] hover:underline hover:cursor-pointer">
          Sign-Up
        </span>
      </div>

      {/* log in with google redirection */}
      <Button className="w-full rounded font-bold text-[#414656] hover:cursor-pointer bg-[#f5f4f4] hover:bg-[#e8e7e7]">
        <Image src={"/google-icon.png"} width={25} height={20} />
        Login with Google
      </Button>

      {/* button handler on the basis of current login method Digilocker/Mobile */}
      {loginWithThirdParty ? (
        <Button
          className="w-full rounded font-bold text-white hover:cursor-pointer"
          onClick={handleSwitchLoginMethod}
        >
          <Image src={"/smartphone.png"} width={15} height={5} />
          Login with Mobile
        </Button>
      ) : (
        <Button variant="outline" className="w-full text-[#5532E8] font-bold border-[#5532E8] hover:text-[#5532E8] rounded" onClick={handleSwitchLoginMethod}>
          <Image src={"/digi-icon.png"} width={25} height={20} />
          Login with Digilocker
        </Button>
      )}
    </div>
  );
}
