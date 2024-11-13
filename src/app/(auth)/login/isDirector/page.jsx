'use client';

import RadioSelect from '@/components/ui/RadioSelect';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const DirectorConsentPage = () => {
  const router = useRouter();
  const [setIsDirectorConsent] = useState(null);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Are you the director?
          </h1>
          <p className="w-full text-center text-sm text-[#A5ABBD]">
            We need the consent of the director to onboard the enterprise.
          </p>
        </div>

        <div className="flex gap-2">
          <RadioSelect
            name="isDirector"
            option="Yes! I am the director"
            value="yes"
            checkBoxName="options"
            handleChange={() => {
              setIsDirectorConsent(true);
              router.push('/login/din');
            }}
          />
          <RadioSelect
            name="isDirector"
            option="No, I am an associate"
            value="no"
            checkBoxName="options"
            handleChange={() => {
              setIsDirectorConsent(false);
              router.push('/login/inviteDirector');
            }}
          />
        </div>

        <div className="flex w-full flex-col gap-14">
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

export default DirectorConsentPage;
