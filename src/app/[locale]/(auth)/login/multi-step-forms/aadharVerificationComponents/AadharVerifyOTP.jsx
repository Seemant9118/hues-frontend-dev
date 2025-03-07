import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Slot from '@/components/ui/Slot';
import { useAuthProgress } from '@/context/AuthProgressContext';
import { useUserData } from '@/context/UserDataContext';
import { LocalStorageService } from '@/lib/utils';
import {
  userUpdate,
  verifyAadharOTP,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import AuthProgress from '../../util-auth-components/AuthProgress';

const AadharVerifyOTP = ({ verifyOTPdata, setVerifyOTPdata }) => {
  const router = useRouter();
  const { updateAuthProgress } = useAuthProgress();
  const { userData } = useUserData(); // context

  // State for button loading
  const [loading, setLoading] = useState(false);

  // user update mutation
  const userUpdatemutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
      LocalStorageService.set(
        'isOnboardingComplete',
        data?.data?.data?.user?.isOnboardingComplete,
      );
      LocalStorageService.set(
        'isPanVerified',
        data?.data?.data?.user?.isPanVerified,
      );
      LocalStorageService.set(
        'isAadhaarVerified',
        data?.data?.data?.user?.isAadhaarVerified,
      );
      LocalStorageService.set(
        'isEmailVerified',
        data?.data?.data?.user?.isEmailVerified,
      );
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data?.data?.data?.user?.isEnterpriseOnboardingComplete,
      );
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
    retry: (failureCount, error) => {
      return error.response.status === 401;
    },
  });

  const handleChangeOtp = (value) => {
    setVerifyOTPdata((prev) => ({
      ...prev,
      otp: value,
    }));
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); // Enable loading state

    try {
      const response = await verifyAadharOTP(verifyOTPdata);

      if (response?.success) {
        // Ensure the response indicates success
        toast.success('OTP verified successfully');

        await userUpdatemutation.mutateAsync(userData); // Await the mutation if needed
        updateAuthProgress('isAadhaarVerified', true);
        router.push('/login/user/confirmation');
      } else {
        toast.error('OTP verification failed. Please try again.');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  return (
    <form
      onSubmit={handleVerifyOTP}
      className="flex h-[400px] w-[450px] flex-col items-center justify-start gap-10"
    >
      <div className="flex flex-col gap-4">
        <AuthProgress isCurrAuthStep={'isAadharVerificationStep'} />
        <h2 className="w-full text-center text-2xl font-bold">
          Verify your Aadhaar
        </h2>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          An one time OTP has been sent to your number through which your
          Aadhaar is registered
        </p>
      </div>

      <OTPInput
        name="otp"
        onChange={handleChangeOtp}
        maxLength={6}
        value={verifyAadharOTP.otp}
        containerClassName="group flex items-center has-[:disabled]:opacity-30"
        render={({ slots }) => (
          <div className="flex gap-4">
            {slots.map((slot) => (
              <Slot key={uuidv4()} {...slot} />
            ))}
          </div>
        )}
      />

      <p className="flex w-full items-center justify-center gap-2 text-sm text-[#A5ABBD]">
        OTP Sent, valid for 10 mins only.
      </p>
      <Button
        size="sm"
        type="submit"
        className="w-full bg-[#288AF9] p-2"
        disabled={loading} // Disable button during loading
      >
        {loading ? <Loading /> : 'Verify'}
      </Button>

      <Link
        href="/"
        className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
      >
        Skip for Now
      </Link>
    </form>
  );
};

export default AadharVerifyOTP;
