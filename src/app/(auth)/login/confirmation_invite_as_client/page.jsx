'use client';

import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const ConfirmationInviteAsClientPage = () => {
  const router = useRouter();
  const inviteData = LocalStorageService.get('invitationData');

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-xl font-bold text-[#121212]">
            {inviteData?.data?.invitation?.fromEnterprise?.name ??
              'fromEnterpriseName'}{' '}
            has invited{' '}
            {inviteData?.data?.invitation?.toEnterprise?.name ?? 'You'}.
          </h1>

          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Continue with{' '}
            {inviteData?.data?.invitation?.toEnterprise?.name ?? 'You'} ?
          </h1>
        </div>

        <div className="flex w-full gap-5">
          <Button
            size="sm"
            type="Submit"
            className="w-full bg-[#288AF9] p-2"
            onClick={() => {
              router.push('/login/enterpriseDetails');
            }}
          >
            Yes
          </Button>

          <Button
            size="sm"
            variant="outline"
            type="Submit"
            className="w-full p-2"
            onClick={() => router.push('/login/enterpriseOnboardingSearch')}
          >
            No
          </Button>
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

export default ConfirmationInviteAsClientPage;
