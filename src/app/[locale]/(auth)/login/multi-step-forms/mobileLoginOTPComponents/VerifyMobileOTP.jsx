/* eslint-disable no-lonely-if */
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import Slot from '@/components/ui/Slot';
import { LocalStorageService } from '@/lib/utils';
import { OTPInput } from 'input-otp';
import { ArrowLeft, Clock5 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const VerifyMobileOTP = ({
  setMobileLoginStep,
  formDataWithMob,
  generateOTPMutation,
  verifyOTPMutation,
}) => {
  const [startFrom, setStartFrom] = useState(30);
  const [otp, setOtp] = useState();

  const userId = LocalStorageService.get('user_profile');
  const userMobileNumber = LocalStorageService.get('user_mobile_number');
  const operationType = LocalStorageService.get('operation_type');
  const islogInWithInviteLink = LocalStorageService.get('invitationData');

  useEffect(() => {
    const timer = setInterval(() => {
      setStartFrom((prevStartFrom) => prevStartFrom - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChangeOtp = (value) => {
    setOtp(value);
  };

  const handleVerifiyOTP = (e) => {
    e.preventDefault();
    verifyOTPMutation.mutate({
      otpCode: otp,
      userId,
      operationType,
      data: islogInWithInviteLink
        ? islogInWithInviteLink.data.invitation
        : islogInWithInviteLink,
    });
  };

  const handleResendOTP = () => {
    generateOTPMutation.mutate(formDataWithMob);
  };

  return (
    <form
      onSubmit={handleVerifiyOTP}
      className="flex h-[400px] w-[450px] flex-col items-center justify-start gap-10"
    >
      <div className="flex flex-col gap-4">
        <h2 className="w-full text-center text-2xl font-bold">
          Verify your number
        </h2>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          An one time OTP has been sent to <span>+91 {userMobileNumber}</span>
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
              onClick={() => {
                setStartFrom(30);
                handleResendOTP(); // api call for re-generateOTP
              }}
            >
              Resend
            </Button>
          )}
        </span>
      </p>

      <div className="flex w-full flex-col gap-2">
        <Button
          size="sm"
          type="Submit"
          className="w-full bg-[#288AF9] p-2"
          disabled={verifyOTPMutation.isPending}
        >
          {verifyOTPMutation.isPending ? <Loading /> : 'Verify'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full p-2"
          onClick={() => setMobileLoginStep(1)}
        >
          <ArrowLeft size={14} />
          Back
        </Button>
      </div>
    </form>
  );
};

export default VerifyMobileOTP;
