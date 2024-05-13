"use client";
import React, { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { UserProvider } from "@/context/UserContext";
import VerifyDetail from "@/components/auth/VerifyDetail";
import { LocalStorageService } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { user_Auth } from "@/api/user_auth/Users";
import { checkKYCstatus } from "@/services/User_Auth_Service/UserAuthServices";
import { Button } from "@/components/ui/button";
import KYCnotificationCard from "@/components/KYCnotificationCard";

export default function DashBoardLayout({ children }) {
  
  // KYC FLOW REMOVED FOR NOW - Don't remove this code till client confirmation
  // const userId = LocalStorageService.get("user_profile");
  // const [isExpireKYC, setExpireKYC] = useState(false); // condional KYCnotification component popUp

  // const { data } = useQuery({
  //   queryKey: [user_Auth.statucKYC.endpointKey],
  //   queryFn: () => checkKYCstatus({ user_id: userId }),
  //   select: (data) => data.data.data,
  // });

  return (
    <UserProvider>
      <Header />
      {/* Veridy Detail component - digilocker flow */}
      {/* {data?.userKyc.kycStatus === "KYC_APPROVAL_PENDING" && (
        <VerifyDetail
          submittedDetails={data.userKyc.profile_diff.submitted_details}
          kycDetails={data.userKyc.profile_diff.kyc_fetch_details}
        />
      )} */}

      {/* Notification KYC status */}
      {/* <KYCnotificationCard isExpireKYC={isExpireKYC} /> */}

      <section className="px-10 grid grid-cols-[250px,_1fr] gap-5 flex-grow pb-5 max-h-full overflow-y-auto relative scrollBarStyles">
        <Sidebar />
        <main className="bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] px-4 pb-4 overflow-y-auto scrollBarStyles">
          {children}
        </main>
      </section>
    </UserProvider>
  );
}
