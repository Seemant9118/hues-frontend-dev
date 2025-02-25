'use client';

import ConfirmationModal from '@/components/auth/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { BadgeCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import AuthProgress from '../util-auth-components/AuthProgress';

const ConfirmationPage = () => {
  const router = useRouter();

  const handleOnboardEnterprise = (e) => {
    e.preventDefault();

    // api call to make enterprise onboarding started
    router.push('/login/enterprise/select_enterprise_type');
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <form
        onSubmit={handleOnboardEnterprise}
        className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
      >
        <div className="flex flex-col items-center gap-6">
          <AuthProgress isCurrAuthStep={'isConfirmationStep'} />
          <BadgeCheck size={48} className="text-primary" />
          <h1 className="max-w-sm text-center text-2xl font-bold text-[#121212]">
            You have been successfully verified and onboarded
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Your next step is to onboard your enterprise to start using this
            platform to its full potential
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Button type="submit" className="w-full" size="sm">
            Onboard Enterprise
          </Button>

          <ConfirmationModal onProceed={handleSkip}>
            <span className="flex w-full cursor-pointer items-center justify-center text-sm font-semibold text-[#121212] hover:underline">
              Skip for Now
            </span>
          </ConfirmationModal>
        </div>
      </form>
    </div>
  );
};

export default ConfirmationPage;
