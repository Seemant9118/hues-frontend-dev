'use client';

import { userAuth } from '@/api/user_auth/Users';
import SubHeader from '@/components/ui/Sub-header';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Wrapper from '@/components/wrappers/Wrapper';
import { LocalStorageService } from '@/lib/utils';
import {
  getProfileDetails,
  LoggingOut,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

function Profile() {
  const userId = LocalStorageService.get('user_profile');
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationKey: [userAuth.logout.endpointKey],
    mutationFn: LoggingOut,
    onSuccess: (res) => {
      LocalStorageService.clear();
      router.push('/login');
      toast.success(res.data.message || 'User Logged Out');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const logout = () => {
    logoutMutation.mutate();
  };

  const { data: profileDetails } = useQuery({
    queryKey: [userAuth.getProfileDetails.endpointKey],
    queryFn: () => getProfileDetails(userId),
    select: (data) => data.data.data,
  });

  const handleUserOnboarding = () => {
    router.push('/login/userOnboarding');
  };

  const handleEnterpriseOnboarding = () => {
    router.push('/login/enterpriseOnboardingSearch');
  };

  return (
    <Wrapper>
      <SubHeader className="flex justify-end">
        <Button variant="blue_outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </SubHeader>

      <div className="my-5 flex flex-col gap-4">
        {/* user details */}
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold">Profile</span>

          {!profileDetails?.userDetails?.user?.isOnboardingCompleted && (
            <div className="relative">
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]">
                {/* by clicking this , i am redirected to currStep 3 */}
                <Button
                  variant="warning"
                  className="w-2/3 shadow-xl"
                  onClick={handleUserOnboarding}
                >
                  Complete Your Profile
                </Button>
              </div>

              <div className="flex justify-between gap-2 rounded-sm border px-28 py-4">
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Name : </Label>
                    <span className="text-md">Your Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Mobile Number : </Label>
                    <span className="text-md">+91 1234567890</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Email ID : </Label>
                    <span className="text-md">test@gmail.com</span>
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-md">PAN Card : </Label>
                    <span className="text-md">XXXXX1234X</span>
                  </div>
                </section>
              </div>
            </div>
          )}

          {profileDetails?.userDetails?.user?.isOnboardingCompleted && (
            <div className="flex justify-between gap-2 rounded-sm border px-28 py-4">
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-md">Name : </Label>
                  <span className="text-md">
                    {profileDetails?.userDetails?.user?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">Mobile Number : </Label>
                  <span className="text-md">
                    {profileDetails?.userDetails?.user?.mobileNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">Email ID : </Label>
                  <span className="text-md">
                    {profileDetails?.userDetails?.email}
                  </span>
                </div>
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-md">PAN Card : </Label>
                  <span className="text-md">
                    {profileDetails?.userDetails?.user?.panNumber}
                  </span>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* enterprise profile */}
        <div className="flex flex-col gap-4">
          <span className="text-xl font-bold">Enterprise Details</span>

          {!profileDetails?.enterpriseDetails?.isOnboardingCompleted && (
            <div className="relative">
              <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center rounded-sm bg-[#dedede88]">
                {/* by clicking this , i am redirected to currStep 4 */}
                <Button
                  variant="warning"
                  className="w-2/3 shadow-xl"
                  onClick={
                    !profileDetails?.userDetails?.isOnboardingCompleted &&
                    !profileDetails?.enterpriseDetails?.isOnboardingCompleted
                      ? handleUserOnboarding
                      : handleEnterpriseOnboarding
                  }
                >
                  Complete Your Profile
                </Button>
              </div>
              <div className="flex justify-between gap-2 rounded-sm border px-28 py-4">
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Name : </Label>
                    <span className="text-md">Enterprise Name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Type : </Label>
                    <span className="text-md">Enteprise Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Mobile Number : </Label>
                    <span className="text-md">+91 1234567980</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">Email ID : </Label>
                    <span className="text-md">test@gmail.com</span>
                  </div>
                </section>

                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-md">PAN Card : </Label>
                    <span className="text-md">XXXX1234X</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">GST IN : </Label>
                    <span className="text-md">XXX48489XX15454</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-md">UDYAM : </Label>
                    <span className="text-md">XXXXXXXXX1234</span>
                  </div>
                </section>
              </div>
            </div>
          )}
          {profileDetails?.enterpriseDetails?.isOnboardingCompleted && (
            <div className="flex justify-between gap-2 rounded-sm border px-28 py-4">
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-md">Name : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">Type : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">Mobile Number : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.mobileNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">Email ID : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.email}
                  </span>
                </div>
              </section>

              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-md">PAN Card : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.panNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">GST IN : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.gstNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-md">UDYAM : </Label>
                  <span className="text-md">
                    {profileDetails?.enterpriseDetails?.udyam}
                  </span>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default Profile;
