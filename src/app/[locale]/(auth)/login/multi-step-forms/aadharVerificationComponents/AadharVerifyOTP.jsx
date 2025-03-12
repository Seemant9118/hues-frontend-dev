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
import { Clock5 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import AuthProgress from '../../util-auth-components/AuthProgress';

const AadharVerifyOTP = ({
  aadharNumber,
  verifyOTPdata,
  setVerifyOTPdata,
  sendAadharOTPMutation,
  startFrom,
  setStartFrom,
}) => {
  const router = useRouter();
  const { updateAuthProgress } = useAuthProgress();
  const { userData } = useUserData(); // context
  const [enterpriseDetails, setEnterpriseDetails] = useState(null);
  // State for button loading
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setEnterpriseDetails(
      LocalStorageService.get('enterpriseDetails') || userData,
    );
  }, []);

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

      LocalStorageService.remove('enterpriseDetails');
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

      if (response?.status === 201) {
        // Ensure the response indicates success
        toast.success('OTP verified successfully');

        await userUpdatemutation.mutateAsync(enterpriseDetails); // Await the mutation if needed
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

  const handleResendOTP = () => {
    sendAadharOTPMutation.mutate({ aadhaar: aadharNumber });
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
        OTP Sent, Resend OTP in{' '}
        <span className="flex items-center gap-1 font-semibold">
          {startFrom >= 0 ? (
            <p className="flex items-center gap-1">
              <Clock5 size={15} />
              00:{startFrom}s
            </p>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={sendAadharOTPMutation?.isPending}
              onClick={() => {
                handleResendOTP();
              }}
            >
              {sendAadharOTPMutation?.isPending ? <Loading /> : 'Resend'}
            </Button>
          )}
        </span>
      </p>
      <Button
        size="sm"
        type="submit"
        className="w-full bg-[#288AF9] p-2"
        disabled={loading} // Disable button during loading
      >
        {loading ? <Loading /> : 'Verify'}
      </Button>
    </form>
  );
};

export default AadharVerifyOTP;
