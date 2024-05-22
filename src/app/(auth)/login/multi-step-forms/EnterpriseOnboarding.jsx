import Tooltips from "@/components/auth/Tooltips";
import { Label } from "@/components/ui/label";
import { Info, Building, CalendarDays, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DatePickers from "@/components/ui/DatePickers";
import { useRouter } from "next/navigation";
import ErrorBox from "@/components/ui/ErrorBox";
import { toast } from "sonner";
import RadioSelect from "@/components/ui/RadioSelect";

const EnterpriseOnboarding = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [enterpriseOnboardData, setEnterpriseOnboard] = useState({
    enterpriseName: "",
    enterpriseType: "",
    gst: "",
    date_of_incorporation: "",
    pan: "",
  });
  const [errorMsg, setErrorMsg] = useState({});

  const enterpriseTypes = [
    "Properitership",
    "Partnership",
    "LLP",
    "Pvt. Ltd. Company",
    "NGO",
  ];

  useEffect(() => {
    setEnterpriseOnboard((prevUserData) => ({
      ...prevUserData,
      date_of_incorporation: selectedDate
        ? moment(selectedDate).format("DD/MM/YYYY")
        : "", // Update dynamically
    }));
  }, [selectedDate]);

  // validation
  const validation = (enterpriseOnboardData) => {
    let error = {};
    const pan_pattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (enterpriseOnboardData.enterpriseName === "") {
      error.enterpriseName = "*Required Enterprise Name";
    }
    if (enterpriseOnboardData.enterpriseType === "") {
      error.enterpriseType = "*Please select your enterprise type";
    }
    if (enterpriseOnboardData.gst === "") {
      error.gst = "*Required GST IN";
    }
    if (enterpriseOnboardData.date_of_incorporation === "") {
      error.date_of_incorporation = "*Required Date of Incorporation";
    }
    if (enterpriseOnboardData.pan === "") {
      error.pan = "*Required PAN Number";
    } else if (!pan_pattern.test(enterpriseOnboardData.pan)) {
      error.pan = "* Please provide valid PAN Number";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // pan validation
    if (name === "pan") {
      const pan_pattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!pan_pattern.test(value) && value.length !== 10) {
        // Reset error message if PAN is valid
        setErrorMsg({
          ...errorMsg,
          pan: "* Please provide valid PAN Number",
        });
      } else {
        // Set error message if PAN is invalid
        setErrorMsg({
          ...errorMsg,
          pan: "",
        });
      }
      setEnterpriseOnboard((values) => ({
        ...values,
        [name]: value.toUpperCase(),
      }));
      return;
    }

    setEnterpriseOnboard((values) => ({ ...values, [name]: value }));
  };

  const handleEnterpriseType = (enterpriseType) => {
    setEnterpriseOnboard((values) => ({
      ...values,
      enterpriseType: enterpriseType,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData);
    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      toast.success("Enterprise Added Succefully");
      // console.log("Form Submitted:", enterpriseOnboardData);
      router.push("/");
    }
    setErrorMsg(isError);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-[#E1E4ED] py-2 px-5 flex flex-col justify-center items-center gap-4 min-h-[500px] w-[450px] bg-white z-20 rounded-md"
    >
      <h1 className="w-full text-2xl text-[#414656] font-bold text-center">
        Enterprise Onboarding
      </h1>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label
          htmlFor="enterpriseName"
          className="text-[#414656] font-medium flex items-center gap-1"
        >
          Enterprise Name <span className="text-red-600">*</span>{" "}
          <Tooltips
            trigger={<Info size={12} />}
            content="Your Enterprise Name"
          />
        </Label>

        <div className="relative">
          <Input
            required
            className="focus:font-bold"
            type="text"
            placeholder="Enterprise Name"
            name="enterpriseName"
            value={enterpriseOnboardData.enterpriseName}
            onChange={handleChange}
          />
          <Building className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
        </div>
        {errorMsg.enterpriseName && <ErrorBox msg={errorMsg.enterpriseName} />}
      </div>

      <div className="grid w-full max-w-sm items-center gap-4 mt-5">
        <Label
          htmlFor="enterpriseType"
          className="text-[#414656] font-medium flex items-center gap-1"
        >
          Select the option that best describes your enterprise
        </Label>
        <div className="flex flex-wrap gap-5">
          {enterpriseTypes.map((type) => (
            <RadioSelect
              key={type}
              option={type}
              value={type.toLowerCase()}
              handleChange={handleEnterpriseType}
            />
          ))}
        </div>
        {errorMsg.enterpriseType && <ErrorBox msg={errorMsg.enterpriseType} />}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label
          htmlFor="gst"
          className="text-[#414656] font-medium flex items-center gap-1"
        >
          GST IN <span className="text-red-600">*</span>{" "}
          <Tooltips trigger={<Info size={12} />} content="GST IN" />
        </Label>

        <div className="relative">
          <Input
            required
            className="focus:font-bold"
            type="text"
            placeholder="GST IN"
            name="gst"
            value={enterpriseOnboardData.gst}
            onChange={handleChange}
          />
          <Building className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
        </div>
        {errorMsg.gst && <ErrorBox msg={errorMsg.gst} />}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label
          htmlFor="dob"
          className="text-[#414656] font-medium flex items-center gap-1"
        >
          Date of Incorporation <span className="text-red-600">*</span>{" "}
          <Tooltips
            trigger={<Info size={12} />}
            content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
          />
        </Label>

        <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <DatePickers
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="dd/MM/yyyy"
            popperPlacement="top-right"
          />
          <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
        </div>
        {errorMsg.date_of_incorporation && (
          <ErrorBox msg={errorMsg.date_of_incorporation} />
        )}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1">
        <Label
          htmlFor="pan-number"
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
            name="pan"
            value={enterpriseOnboardData.pan}
            onChange={handleChange}
          />
          <CreditCard className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
        </div>
        {errorMsg.pan && <ErrorBox msg={errorMsg.pan} />}
      </div>

      {/* {errorMsg?.name && <ErrorBox msg={errorMsg?.name} />} */}
      <Button type="submit" className="mt-4 w-full">
        Submit
      </Button>

      <Link
        href="/"
        className="text-sm underline text-slate-700 w-full flex justify-center items-center"
      >
        Skip for Now
      </Link>
    </form>
  );
};

export default EnterpriseOnboarding;
