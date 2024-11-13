import { Button } from '@/components/ui/button';
import Slot from '@/components/ui/Slot';
import { LocalStorageService } from '@/lib/utils';
import { OTPInput } from 'input-otp';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const VerifyMailUser = ({ setUserOnboardingStep }) => {
  const router = useRouter();
  const [otp, setOtp] = useState();
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const isKycVerified = LocalStorageService.get('isKycVerified');

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    toast.success('Your Profile Completed & Verified');
    if (isEnterpriseOnboardingComplete && isKycVerified) {
      router.push('/');
    } else if (isEnterpriseOnboardingComplete && !isKycVerified) {
      router.push('/login/kyc'); // kyc page
    }
    router.push('/login/enterpriseOnboardingSearch'); // enterpriseOnboardingSearch
  };

  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-4">
        <h2 className="w-full text-center text-2xl font-bold">
          Verify your mail
        </h2>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          A OTP code is sent to your inbox
        </p>
      </div>

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

      <p className="flex w-full items-center justify-center gap-2 text-sm text-[#A5ABBD]">
        OTP valid for 5 minutes
      </p>
      <Button size="sm" type="Submit" className="w-full bg-[#288AF9] p-2">
        Verify
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="w-full p-2"
        onClick={() => setUserOnboardingStep(1)}
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </form>
  );
};

export default VerifyMailUser;
