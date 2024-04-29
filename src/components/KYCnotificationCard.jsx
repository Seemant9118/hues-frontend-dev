import React from "react";
import { Button } from "./ui/button";

const KYCnotificationCard = ({ isExpireKYC }) => {
  return (
    <div
      className={
        isExpireKYC
          ? "flex justify-between items-center mx-10 py-2 px-5  bg-[#FFFF] rounded-md shadow-[0_4px_6px_0_#3288ED1A]"
          : "flex justify-between items-center mx-10 py-2 px-5 border border-[#F8BA05] bg-[#F8BA0533] rounded-md"
      }
    >
      <span className={isExpireKYC ? "" : "font-bold text-[#CE9D0C]"}>
        {isExpireKYC
          ? "Your KYC request expired. Please continue to verify your details"
          : "Your KYC request is still valid. Please continue to verify your details"}
      </span>
      <Button
        className="h-9 w-34"
        variant={isExpireKYC ? "default" : "warning"}
      >
        Verify KYC
      </Button>
    </div>
  );
};

export default KYCnotificationCard;
