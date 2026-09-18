'use client';

import { ArrowRight, CreditCard, Phone, ShieldCheck } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import InputWithLabel from '@/components/ui/InputWithLabel';
import Loading from '@/components/ui/Loading';

export default function SharedResourceIdentityGate({
  identity,
  setIdentity,
  onSubmit,
  isLoading,
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-8">
      <Card className="rounded-2xl border-neutral-200 bg-white p-2 shadow-xl sm:p-4">
        <CardHeader className="text-center sm:text-left">
          {/* Header Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <CardTitle className="mt-4 text-lg font-bold text-neutral-800 sm:text-xl">
            Identity Verification Required
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-neutral-500">
            This custom form is shared privately. Please enter your PAN and
            mobile number to verify your identity and receive a one-time
            passcode (OTP).
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Verification Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* PAN Number */}
            <div>
              <InputWithLabel
                name="Permanent Account Number (PAN)"
                placeholder="e.g. ABCDE1234F"
                type="text"
                value={identity.panNumber}
                maxLength={10}
                required
                className="rounded-sm font-mono uppercase"
                rightIcon={<CreditCard className="h-4 w-4 text-neutral-400" />}
                onChange={(e) =>
                  setIdentity((prev) => ({
                    ...prev,
                    panNumber: e.target.value.toUpperCase().slice(0, 10),
                  }))
                }
              />
              <p className="mt-1 text-[10px] text-neutral-400">
                Enter the 10-character PAN designated for this private share.
              </p>
            </div>

            {/* Mobile Number */}
            <div>
              <InputWithLabel
                name="Mobile Number"
                placeholder="10-digit mobile number"
                type="tel"
                value={identity.mobileNumber}
                maxLength={15}
                required
                className="rounded-sm font-mono"
                rightIcon={<Phone className="h-4 w-4 text-neutral-400" />}
                onChange={(e) =>
                  setIdentity((prev) => ({
                    ...prev,
                    mobileNumber: e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 15),
                  }))
                }
              />
              <p className="mt-1 text-[10px] text-neutral-400">
                SMS verification code will be dispatched to this number.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className="w-full gap-2"
            >
              {isLoading ? (
                <Loading />
              ) : (
                <>
                  <span>Verify & Send OTP</span>
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
