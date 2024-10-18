'use client';

import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { userVerifyOtp } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { Clock5 } from 'lucide-react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Slot from '@/components/ui/Slot';

export default function OTPVerificationForm({ setCurrStep }) {
  const [startFrom, setStartFrom] = useState(30);
  const [otp, setOtp] = useState();
  const userId = LocalStorageService.get('user_profile');
  const userMobileNumber = LocalStorageService.get('user_mobile_number');
  const operationType = LocalStorageService.get('operation_type');
  const invitationData = LocalStorageService.get('invitationData');
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  });

  const mutation = useMutation({
    mutationFn: (data) => userVerifyOtp(data),
    onSuccess: (data) => {
      LocalStorageService.set('token', data.data.data.access_token);
      LocalStorageService.set(
        'enterprise_Id',
        data.data.data.user.enterpriseId,
      );
      LocalStorageService.set(
        'isOnboardingComplete',
        data.data.data.user.isOnboardingComplete,
      );
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data.data.data.user.isEnterpriseOnboardingComplete,
      );
      toast.success('OTP verified successfully');

      // if both userOnboarding & enterpriseOnboarding completed, then redirect to Home Page
      if (
        data.data.data.user.isOnboardingComplete &&
        data.data.data.user.isEnterpriseOnboardingComplete
      ) {
        const redirectUrl = LocalStorageService.get('redirectUrl');
        LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
        router.push(redirectUrl || '/');
      }
      // if userOnboarding is completed but enterpriseOnboarding is not completed, then redirected to enterpriseOnboarding page
      else if (
        data.data.data.user.isOnboardingComplete &&
        !data.data.data.user.isEnterpriseOnboardingComplete
      ) {
        setCurrStep(4);
      }
      // if both userOnboarding and enterpriseOnboarding is inCompleted, then stay in normal flow.
      else {
        setCurrStep(3);
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'OTP Invalid or Expired');
    },
  });

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    mutation.mutate({
      otpCode: otp,
      userId,
      operationType,
      data: invitationData ? invitationData.data.invitation : invitationData,
    });
  };

  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="z-20 flex h-[500px] w-[450px] flex-col items-center justify-center gap-5 rounded-md border border-[#E1E4ED] bg-white p-10"
    >
      <h1 className="w-full text-center text-3xl font-bold text-[#414656]">
        Welcome to HuesERP!
      </h1>
      <p className="w-full text-center text-xl text-[#414656]">
        One account for all things <span className="font-bold">Hues</span>
      </p>
      <h2 className="w-full text-2xl font-bold">Verify OTP</h2>
      <p className="w-full text-sm">
        A one time password has been sent to{' '}
        <span className="font-bold text-[#414656]">+91 {userMobileNumber}</span>
      </p>

      <OTPInput
        name="otp"
        onChange={handleChangeOtp}
        maxLength={4}
        value={otp}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4()} {...slot} />
            ))}
          </div>
        )}
      />

      <p className="flex w-full items-center gap-2 text-sm text-[#A5ABBD]">
        Resend OTP in :{' '}
        <span className="flex items-center gap-1 font-semibold">
          {startFrom >= 0 ? (
            <p className="flex items-center gap-1">
              <Clock5 size={15} />
              00:{startFrom}s
            </p>
          ) : (
            <Button variant="outline" disabled>
              Resend
            </Button>
          )}
        </span>
      </p>
      <Button type="Submit" className="w-full">
        {mutation.isPending ? <Loading /> : 'Submit'}
      </Button>
    </form>
  );
}
