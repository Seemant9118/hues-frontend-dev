'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from '@/i18n/routing';
import { BadgeCheck } from 'lucide-react';

import React from 'react';
import { toast } from 'sonner';

const EnterpriseConfirmationPage = () => {
  const router = useRouter();

  const handleContinue = (e) => {
    e.preventDefault();

    toast.success('Logged In Successfully');
    router.push('/');
  };

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <form
        onSubmit={handleContinue}
        className="flex min-h-[500px] w-[450px] flex-col gap-10 rounded-md"
      >
        <div className="flex flex-col items-center gap-6">
          <BadgeCheck size={48} className="text-primary" />
          <h1 className="text-center text-2xl font-bold text-[#121212]">
            Your Enterprise have been successfully verified and onboarded
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Your are now able to access all the features of the platform and
            start using it.
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Button type="submit" className="w-full" size="sm">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnterpriseConfirmationPage;
