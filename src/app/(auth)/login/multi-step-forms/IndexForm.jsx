"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocalStorageService, cn } from "@/lib/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  loginWithInvitation,
  userGenerateOtp,
} from "@/services/User_Auth_Service/UserAuthServices";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import Loading from "@/components/ui/Loading";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Invitation } from "@/api/invitation/Invitation";
import { validationBase64 } from "@/services/Invitation_Service/Invitation_Service";

export default function IndexForm({ setCurrStep, setIsThirdPartyLogin }) {
  // const [loginWithThirdParty, setLoginWithThirdParty] = useState(true); // digilocker (thirdParty) by default active

  // const [formDataWithDigi, setFormDataWithDigi] = useState({
  //   aadhaarNumber: '',
  // });

  const [formDataWithMob, setFormDataWithMob] = useState({
    mobile_number: "",
    country_code: "+91",
  });
  const [errorMsg, setErrorMsg] = useState("");

  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("invitationToken");

  //  if invitation login flow then
  const {
    isLoading,
    error,
    data: inviteData,
    isSuccess,
  } = useQuery({
    queryKey: [Invitation.validationBase64.endpointKey],
    queryFn: () => (invitationToken ? validationBase64(invitationToken) : ""),
    enabled: !!invitationToken,
    select: (data) => data.data.data,
  });
  console.log(inviteData);

  useEffect(() => {
    if (isSuccess) {
      setFormDataWithMob((values) => ({
        ...values,
        mobile_number: inviteData.mobile_number,
      }));
    }
  }, [isSuccess, inviteData]);

  // login with invitation
  const loginInvitation = useMutation({
    mutationFn: loginWithInvitation,
    onSuccess: (data) => {
      LocalStorageService.set("user_profile", data.data.data.userId);
      LocalStorageService.set("user_mobile_number", inviteData.mobile_number);
      LocalStorageService.set("operation_type", data.data.data.operation_type);
      toast.success(data.data.message);
      setCurrStep(2);
    },
    onError: () => {
      setErrorMsg("Failed to send OTP");
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => userGenerateOtp(data),
    onSuccess: (data) => {
      LocalStorageService.set("user_profile", data.data.data.userId);
      LocalStorageService.set(
        "user_mobile_number",
        formDataWithMob.mobile_number
      );
      LocalStorageService.set("operation_type", data.data.data.operation_type);
      toast.success(data.data.message);
      setCurrStep(2);
    },
    onError: () => {
      setErrorMsg("Failed to send OTP");
    },
  });

  // const handleSwitchLoginMethod = () => {
  //   setLoginWithThirdParty(!loginWithThirdParty);
  //   setErrorMsg('');
  //   setFormDataWithDigi({ aadhaarNumber: '' });
  //   setFormDataWithMob({ mobile_number: '' })
  //   setIsThirdPartyLogin(!loginWithThirdParty);
  // };

  // const handleChangeDigiLogin = (e) => {
  //   let name = e.target.name;
  //   let value = e.target.value;

  //   setFormDataWithDigi(values => ({ ...values, [name]: value }));
  //   // handle validation
  //   formDataWithDigi.aadhaarNumber.length !== 11 ? setErrorMsg('*Please enter a valid UIDAI Aadhaar Number') : setErrorMsg('');
  // };

  const handleChangeMobLogin = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    // handle validation
    if (value.length !== 10) {
      setErrorMsg("*Please enter a 10 - digit mobile number");
    } else {
      setErrorMsg("");
    }
    setFormDataWithMob((values) => ({ ...values, [name]: value }));
  };

  // const handleSubmitFormWithDigi = (e) => {
  //   e.preventDefault();
  //   if (!errorMsg) {
  //     console.log(formDataWithDigi);
  //     setCurrStep(3);
  //   }
  // };

  const handleSubmitFormWithMob = (e) => {
    e.preventDefault();
    if (!errorMsg) {
      if (!invitationToken) {
        mutation.mutate(formDataWithMob); //normal flow
      } else {
        loginInvitation.mutate({
          ...inviteData,
          mobile_number: formDataWithMob.mobile_number,
        }); // invitation flow
      }
    }
  };

  return (
    <div className="border border-[#E1E4ED] p-10 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md">
      <h1 className="w-full text-3xl text-[#414656] font-bold text-center">
        Welcome to Hues!
      </h1>
      <p className="w-full text-xl text-[#414656] text-center">
        One account for all things{" "}
        <span className="font-bold">Paraphernalia</span>
      </p>

      {isLoading && (
        <div className="flex flex-col">
          <span>Validating Invitation ...</span>
          <Loading />
        </div>
      )}
      {/* login with mobile */}
      <form
        onSubmit={handleSubmitFormWithMob}
        className="grid w-full max-w-sm items-center gap-3.5"
      >
        <div className="flex flex-col gap-1">
          <Label htmlFor="mobile-number" className="text-[#414656] font-medium">
            Mobile Number <span className="text-red-600">*</span>
          </Label>
          <div className="hover:border-gray-600 flex items-center gap-1 relative">
            <span className="absolute left-1.5 font-semibold text-gray-600 text-sm">
              +91
            </span>
            <Input
              type="text"
              name="mobile_number"
              placeholder="Mobile Number"
              className="focus:font-bold px-8"
              onChange={handleChangeMobLogin}
              value={formDataWithMob.mobile_number}
              required
            />

            <Phone className=" text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
          {errorMsg && (
            <span className="text-red-600 text-sm w-full px-1 font-semibold">
              {errorMsg}
            </span>
          )}
        </div>

        <Button
          type="submit"
          className="w-full rounded font-bold text-white hover:cursor-pointer"
        >
          {mutation.isPending ? (
            <Loading />
          ) : (
            <>
              <Image
                src={"/smartphone.png"}
                alt="smartph-icon"
                width={15}
                height={5}
              />
              <p>Login with Mobile</p>
            </>
          )}
        </Button>
      </form>

      {/* {loginWithThirdParty ? (
        <form onSubmit={handleSubmitFormWithDigi} className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="adhar-number"
            className="text-[#414656] font-medium"
          >
            Aadhaar Number <span className="text-red-600">*</span>

          </Label>

          <div className="hover:border-gray-600 flex items-center gap-1 relative">

            <Input className={cn("focus:font-bold")} type="tel" placeholder="Aadhaar Number" name="aadhaarNumber" onChange={handleChangeDigiLogin} value={formDataWithDigi.aadhaarNumber} required />
            <span className="text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2">@</span>
          </div>

          {errorMsg ? <span className="text-red-600 text-sm w-full px-1 font-semibold">{errorMsg}</span> : ""}

          <Button type="submit" variant="outline" className="w-full text-[#5532E8] font-bold border-[#5532E8] hover:text-[#5532E8] rounded">
            <Image src={"/digi-icon.png"} alt="digi-icon" width={25} height={20} />

            Login with DigiLocker
          </Button>
        </form>
      ) : (


        <form onSubmit={handleSubmitFormWithMob} className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="text-[#414656] font-medium"
          >
            Mobile Number <span className="text-red-600">*</span>
          </Label>
          <div className="hover:border-gray-600 flex items-center gap-1 relative">
            <Input type="text" name="mobileNumber" placeholder="Mobile Number" className="focus:font-bold" onChange={handleChangeMobLogin} value={formDataWithMob.mobileNumber} required />

            <Phone className=" text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
          {errorMsg && <span className="text-red-600 text-sm w-full px-1 font-semibold">{errorMsg}</span>}

          <Button type="submit"
            className="w-full rounded font-bold text-white hover:cursor-pointer"
          >
            <Image src={"/smartphone.png"} alt="smartph-icon" width={15} height={5} />
            Login with Mobile
          </Button>
        </form>
      )} */}

      {/* signup redirection */}
      <div className="w-full py-2 px-4 flex justify-center gap-1 font-bold text-[#414656]">
        Not a Hues subscriber yet?{" "}
        <span className="text-[#288AF9] hover:underline hover:cursor-pointer">
          Sign-up
        </span>
      </div>

      {/* log in with google redirection */}
      <Button className="w-full rounded font-bold text-[#414656] hover:cursor-pointer bg-[#f5f4f4] hover:bg-[#e8e7e7]">
        <Image
          src={"/google-icon.png"}
          alt="google-icon"
          width={25}
          height={20}
        />
        Login with Google
      </Button>

      {/* button handler on the basis of current login method Digilocker/Mobile */}
      {/* {loginWithThirdParty ? (
        <Button
          className="w-full rounded font-bold text-white hover:cursor-pointer"
          onClick={handleSwitchLoginMethod}
        >
          <Image src={"/smartphone.png"} alt="smartPh-icon" width={15} height={5} />
          Login with Mobile
        </Button>
      ) : (
        <Button variant="outline" className="w-full text-[#5532E8] font-bold border-[#5532E8] hover:text-[#5532E8] rounded" onClick={handleSwitchLoginMethod}>
          <Image src={"/digi-icon.png"} alt="digi-icon" width={25} height={20} />
          Login with Digilocker
        </Button>
      )} */}
    </div>
  );
}
