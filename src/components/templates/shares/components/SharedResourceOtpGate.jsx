'use client';

import { ArrowRight, Clock5, KeyRound, RotateCcw } from 'lucide-react';
import { OTPInput } from 'input-otp';
import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Loading from '@/components/ui/Loading';
import Slot from '@/components/ui/Slot';

export default function SharedResourceOtpGate({
  otpCode,
  setOtpCode,
  onSubmit,
  isLoading,
  onResendOtp,
  resendCountdown,
  isRequestingOtp,
  mobileNumber,
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <Card className="rounded-2xl border-neutral-200 bg-white p-2 shadow-xl sm:p-4">
        <CardHeader className="text-center sm:text-left">
          {/* Header Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
            <KeyRound className="h-6 w-6" />
          </div>

          <CardTitle className="mt-4 text-lg font-bold text-neutral-800 sm:text-xl">
            Enter Verification Code
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-neutral-500">
            We have dispatched a verification code via SMS to{' '}
            <strong className="text-neutral-700">
              {mobileNumber
                ? `+91 ${mobileNumber.slice(-4).padStart(10, '•')}`
                : 'your mobile'}
            </strong>
            .
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Form */}
          <form
            onSubmit={onSubmit}
            className="flex flex-col items-center gap-6"
          >
            <div className="flex w-full flex-col items-center gap-2">
              <label className="text-center text-xs font-bold text-neutral-700">
                One-Time Password (OTP)
              </label>

              {/* OTP Input using input-otp & Slot from login page */}
              <div className="flex w-full justify-center py-2">
                <OTPInput
                  name="otp"
                  onChange={setOtpCode}
                  maxLength={4}
                  value={otpCode}
                  containerClassName="group flex items-center justify-center has-[:disabled]:opacity-30"
                  render={({ slots }) => (
                    <div className="flex gap-3 sm:gap-4">
                      {slots.map((slot) => (
                        <Slot key={uuidv4()} {...slot} />
                      ))}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Resend Section */}
            <div className="flex w-full items-center justify-between text-xs text-neutral-500">
              <span>Didn&apos;t receive the code?</span>
              {resendCountdown > 0 ? (
                <span className="flex items-center gap-1 font-mono text-neutral-500">
                  <Clock5 size={13} />
                  Resend in {resendCountdown.toString().padStart(2, '0')}s
                </span>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  disabled={isRequestingOtp}
                  onClick={onResendOtp}
                  className="h-auto p-0 font-bold text-primary hover:bg-transparent hover:underline disabled:opacity-50"
                >
                  <RotateCcw size={12} className="mr-1" />
                  Resend OTP
                </Button>
              )}
            </div>

            {/* Verify Button */}
            <Button
              size="sm"
              type="submit"
              disabled={isLoading || otpCode?.length !== 4}
              className="w-full gap-2"
            >
              {isLoading ? (
                <Loading />
              ) : (
                <>
                  <span>Verify & Open Form</span>
                  <ArrowRight size={14} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
