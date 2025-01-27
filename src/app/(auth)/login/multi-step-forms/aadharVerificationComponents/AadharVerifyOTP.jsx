import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Slot from '@/components/ui/Slot';
import { useAuthProgress } from '@/context/AuthProgressContext';
import { LocalStorageService } from '@/lib/utils';
import { verifyAadharOTP } from '@/services/User_Auth_Service/UserAuthServices';
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

  // State for button loading
  const [loading, setLoading] = useState(false);

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
      const { data } = response;

      toast.success('OTP verified successfully');
      LocalStorageService.set(
        'isOnboardingComplete',
        data?.data?.isOnboardingComplete,
      );
      LocalStorageService.set(
        'isAadhaarVerified',
        data?.data?.isAadhaarVerified,
      );
      LocalStorageService.set('isEmailVerified', data?.data?.isEmailVerified);

      updateAuthProgress('isAadhaarVerified', true);
      router.push('/login/confirmation');
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
