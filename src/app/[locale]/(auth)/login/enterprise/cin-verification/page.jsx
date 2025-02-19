'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const CINVerificationPage = () => {
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // api call to verify CIN, then redirect to enterprise verification  page
  };

  const handleBack = () => {
    router.push('/login/enterprise/onboard_enterprise');
  };
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            We found a CIN for this enterpise
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Verify the CIN Number and continue
          </p>
        </div>

        <form
          className="grid w-full items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="cin" className="font-medium text-[#121212]">
              CIN
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="cin"
                placeholder="Enter your CIN number"
                className="uppercase focus:font-bold"
              />
            </div>
          </div>

          <Button size="sm" type="submit">
            Verify
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            Back
          </Button>
        </form>

        <div className="flex w-full flex-col gap-20">
          <Link
            href="/"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            Skip for Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CINVerificationPage;
