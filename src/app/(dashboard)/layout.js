"use client";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import { UserProvider } from "@/context/UserContext";

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
