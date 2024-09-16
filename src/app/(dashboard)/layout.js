'use client';

import Header from '@/components/ui/Header';
import Sidebar from '@/components/ui/Sidebar';
import { UserProvider } from '@/context/UserContext';

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

      <section className="relative grid max-h-full flex-grow grid-cols-[250px,_1fr] gap-5 overflow-y-hidden px-10 pb-5">
        <Sidebar />
        <main className="scrollBarStyles overflow-y-auto rounded-xl bg-white px-4 pb-4 shadow-[0_4px_6px_0_#3288ED1A]">
          {children}
        </main>
      </section>
    </UserProvider>
  );
}
