import { Button } from '@/components/ui/button';
import Slot from '@/components/ui/Slot';
import { OTPInput } from 'input-otp';
import { Clock5 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AadharVerifyOTP = () => {
  const router = useRouter();
  const [otp, setOtp] = useState();
  const [startFrom, setStartFrom] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  });

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    // api call
    router.push('/login/enterpriseOnboardingSearch');
  };
  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="flex h-[400px] w-[450px] flex-col items-center justify-start gap-10"
    >
      <div className="flex flex-col gap-4">
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
      <Button size="sm" type="Submit" className="w-full bg-[#288AF9] p-2">
        Verify
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
