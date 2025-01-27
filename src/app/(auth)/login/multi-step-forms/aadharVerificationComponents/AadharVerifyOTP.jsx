import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Slot from '@/components/ui/Slot';
import { useAuthProgress } from '@/context/AuthProgressContext';
import { LocalStorageService } from '@/lib/utils';
import { verifyAadharOTP } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { OTPInput } from 'input-otp';
import { Clock5 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import AuthProgress from '../../util-auth-components/AuthProgress';

const AadharVerifyOTP = ({ verifyOTPdata, setVerifyOTPdata }) => {
  const router = useRouter();

  const { updateAuthProgress } = useAuthProgress();

  const [startFrom, setStartFrom] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  });

  const handleChangeOtp = (value) => {
    setVerifyOTPdata((prev) => ({
      ...prev,
      otp: value,
    }));
  };

  const verifyAadharOTPMutation = useMutation({
    mutationKey: [userAuth.verifyAadharOTP.endpointKey],
    mutationfn: (data) => verifyAadharOTP(data),
    onSuccess: (data) => {
      toast.success('OTP verified successfully');

      LocalStorageService.set(
        'isAadharVerified',
        data?.data?.data?.user?.isAadharVerified,
      );
      LocalStorageService.set(
        'isEmailVerified',
        data?.data?.data?.user?.isEmailVerified,
      );

      // marked aadhar verified in context
      updateAuthProgress('isAadharVerified', true);

      // redirection
      router.push('/login/confirmation');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    verifyAadharOTPMutation.mutate(verifyOTPdata);
  };

  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="flex h-[400px] w-[450px] flex-col items-center justify-start gap-10"
    >
      <div className="flex flex-col gap-4">
        <AuthProgress />
        <h2 className="w-full text-center text-2xl font-bold">
          Verify your Aadhar
        </h2>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          An one time OTP has been sent to your number through which your adhaar
          is registered
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
        Resend OTP in{' '}
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
              onClick={() => setStartFrom(30)}
            >
              Resend
            </Button>
          )}
        </span>
      </p>
      <Button
        size="sm"
        type="submit"
        className="w-full bg-[#288AF9] p-2"
        disabled={verifyAadharOTPMutation.isPending}
      >
        {verifyAadharOTPMutation.isPending ? <Loading /> : 'Verify'}
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
