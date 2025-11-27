/* eslint-disable consistent-return */

'use client';

import { directorApi } from '@/api/director/directorApi';
import { goToHomePage } from '@/appUtils/redirectionUtilFn';
import ConfirmationModal from '@/components/auth/ConfirmationModal';
import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import { directorInviteList } from '@/services/Director_Services/DirectorServices';
import { useQueryClient } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React from 'react';
import AuthProgress from '../../util-auth-components/AuthProgress';

const ConfirmationPage = () => {
  const translations = useTranslations('auth.confirmation');
  const queryClient = useQueryClient();
  const router = useRouter();
  const islogInWithInviteLink = LocalStorageService.get('invitationData');

  const handleOnboardEnterprise = async (e) => {
    e.preventDefault();
    if (islogInWithInviteLink) {
      // check by calling api : directorInviteList
      const directorInviteListData = await queryClient.fetchQuery({
        queryKey: [directorApi.getDirectorInviteList.endpointKey],
        queryFn: directorInviteList,
      });
      const isUserHaveValidDirectorInvites =
        directorInviteListData?.data?.data?.length > 0;

      const type = islogInWithInviteLink?.data?.invitation?.invitationType;

      if (type === 'CLIENT' || type === 'VENDOR') {
        return router.push('/login/enterprise/select_enterprise_type');
      } else if (type === 'DIRECTOR' && isUserHaveValidDirectorInvites) {
        return router.push('/login/confirmation_invite_as_director');
      } else {
        return router.push('/login/confirmation_invite_as_associate');
      }
    }
    router.push('/login/enterprise/select_enterprise_type');
  };

  const handleSkip = () => {
    router.push(goToHomePage());
  };

  return (
    <div className="flex h-full flex-col items-center pt-20">
      <form
        onSubmit={handleOnboardEnterprise}
        className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
      >
        <div className="flex flex-col items-center gap-6">
          <AuthProgress isCurrAuthStep={'isConfirmationStep'} />
          <BadgeCheck size={48} className="text-primary" />
          <h1 className="max-w-sm text-center text-2xl font-bold text-[#121212]">
            {translations('title')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('subtitle')}
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Button type="submit" className="w-full" size="sm">
            {translations('onboard_button')}
          </Button>

          <ConfirmationModal onProceed={handleSkip}>
            <span className="flex w-full cursor-pointer items-center justify-center text-sm font-semibold text-[#121212] hover:underline">
              {translations('skip_link')}
            </span>
          </ConfirmationModal>
        </div>
      </form>
    </div>
  );
};

export default ConfirmationPage;
