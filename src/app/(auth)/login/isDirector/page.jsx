'use client';

import CustomLinks from '@/components/ui/CustomLinks';
import { LocalStorageService } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

const DirectorConsentPage = () => {
  const enterpriseType = LocalStorageService.get('enterpriseType');

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

        <div className="flex max-w-md gap-2 p-2">
          <CustomLinks
            href={
              enterpriseType === 'proprietorship' ? '/login/kyc' : '/login/din'
            }
            linkName="Yes! I am the director"
          />
          <CustomLinks
            href={'/login/inviteDirector'}
            linkName="No, I am an associate"
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
