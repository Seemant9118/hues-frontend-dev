'use client';

import CustomLinks from '@/components/ui/CustomLinks';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

const DirectorConsentPage = () => {
  const enterpriseType = LocalStorageService.get('enterpriseType') || '';
  const isKycVerified = LocalStorageService.get('isKycVerified') || false;

  const yesDirectorLink = () => {
    const isProprietorship = enterpriseType === 'proprietorship';
    if (isProprietorship && isKycVerified) {
      return '/';
    } else if (isProprietorship && !isKycVerified) {
      return '/login/kyc';
    } else {
      return '/login/din';
    }
  };

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
          {/* Heading Section */}
          <div className="flex flex-col gap-4">
            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              Are you the director?
            </h1>
            <p className="w-full text-center text-sm text-[#A5ABBD]">
              We need the consent of the director to onboard the enterprise.
            </p>
          </div>

          {/* Action Links */}
          <div className="flex max-w-md gap-2 p-2">
            <CustomLinks
              href={yesDirectorLink()}
              linkName="Yes! I am the director"
            />
            <CustomLinks
              href={'/login/inviteDirector'}
              linkName="No, I am an associate"
            />
          </div>

          {/* Skip for Now Link */}
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
    </UserProvider>
  );
};

export default DirectorConsentPage;
