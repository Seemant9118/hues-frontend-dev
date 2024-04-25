"use client";
import { Clock5 } from "lucide-react";
import { OTPInput } from "input-otp";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { userVerifyOtp } from "@/services/User_Auth_Service/UserAuthServices";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Oval } from "react-loader-spinner";
import { LocalStorageService } from "@/lib/utils";
import { useUser } from "@/context/UserContext";
import Script from "next/script";

function Slot(props) {
  return (
    <div
      className={cn(
        "relative w-10 h-14 text-[2rem]",
        "flex items-center justify-center",
        "transition-all duration-300",
        "border-2 rounded-md bg-[#A5ABBD1A] focus:bg-blue-600",
        "group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20",
        "outline outline-0 outline-accent-foreground/20",
        { "outline-4 outline-accent-foreground": props.isActive }
      )}
    >
      {props.char !== null && (
        <div className="text-[#288AF9]">{props.char}</div>
      )}
    </div>
  );
}

export default function OTPVerificationForm({ setCurrStep }) {
  const [otp, setOtp] = useState();
  const userId = LocalStorageService.get("user_profile");

  const mutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    onSuccess: (data) => {
      LocalStorageService.set("token", data.data.data.access_token);
      toast.success("OTP verified successfully");
      setCurrStep(3);
    },
    onError: () => {
      toast.error("OTP Invalid or Expired");
    },
  });

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    mutation.mutate({
      otp_code: otp,
      user_id: userId,
    });
  };

  return (
    <>
      <form
        onSubmit={handleVerifiyOTP}
        className="border border-[#E1E4ED] p-10 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md"
      >
        <h1 className="w-full text-3xl text-[#414656] font-bold text-center">
          Welcome to HuesERP!
        </h1>
        <p className="w-full text-xl text-[#414656] text-center">
          One account for all things <span className="font-bold">Hues</span>
        </p>
        <h2 className="w-full font-bold text-2xl">Verify OTP</h2>
        <p className="w-full text-sm">
          A one time password has been sent to{" "}
          <span className="text-[#414656] font-bold">+91 9876 54310</span>
        </p>

        <OTPInput
          name="otp"
          onChange={handleChangeOtp}
          maxLength={4}
          value={otp}
          containerClassName="group flex items-center has-[:disabled]:opacity-30"
          render={({ slots }) => (
            <div className="flex gap-4 ">
              {slots.map((slot, idx) => (
                <Slot key={idx} {...slot} />
              ))}
            </div>
          )}
        />

        <p className="w-full text-sm text-[#A5ABBD] flex items-center gap-2">
          Waiting for resend OTP{" "}
          <span className="font-semibold flex items-center gap-1">
            <Clock5 size={15} />
            00:54
          </span>
        </p>
        <Button type="Submit" className="w-full">
          {mutation.isPending ? (
            <Oval
              visible={true}
              height="20"
              width="20"
              color="#fff"
              ariaLabel="oval-loading"
              wrapperStyle={{}}
              wrapperClass=""
            />
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </>
  );
}
