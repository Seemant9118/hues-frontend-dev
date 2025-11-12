'use client';

import { redirectToHomeWithFcm } from '@/appUtils/helperFunctions';
import { Button } from '@/components/ui/button';
import { BadgeCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import React from 'react';
import { toast } from 'sonner';

const EnterpriseConfirmationPage = () => {
  const router = useRouter();
  const translations = useTranslations(
    'auth.enterprise.enterpriseConfirmation',
  );

  const handleContinue = (e) => {
    e.preventDefault();

    toast.success(translations('toastSuccess'));
    redirectToHomeWithFcm(router);
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleContinue}
        className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
      >
        <div className="flex flex-col items-center gap-6">
          <BadgeCheck size={48} className="text-primary" />
          <h1 className="text-center text-2xl font-bold text-[#121212]">
            {translations('heading')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('description')}
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Button type="submit" className="w-full" size="sm">
            {translations('continueButton')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EnterpriseConfirmationPage;
