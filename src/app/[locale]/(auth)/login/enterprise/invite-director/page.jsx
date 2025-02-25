'use client';

import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import InviteDirectorIndexNew from '../../multi-step-forms/inviteDirectorComponents/InviteDirectorIndexNew';
import ShareLinkToDirectorNew from '../../multi-step-forms/inviteDirectorComponents/ShareLinkToDirectorNew';

const InviteDirectorPage = () => {
  const invitationId = LocalStorageService.get('invitationId');
  const searchParams = useSearchParams();
  const step = Number(searchParams.get('step')); // Convert to number
  const [directorInviteStep, setDirectorInviteStep] = useState(1);
  const [invitationUrl, setInvitationUrl] = useState('');

  useEffect(() => {
    if (!Number.isNaN(step)) {
      // Ensure step is a valid number
      setDirectorInviteStep(step);
    }
  }, [step]);

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        {directorInviteStep === 1 && (
          <InviteDirectorIndexNew
            setDirectorInviteStep={setDirectorInviteStep}
            setInvitationUrl={setInvitationUrl}
          />
        )}
        {directorInviteStep === 2 && (
          <ShareLinkToDirectorNew
            invitationId={invitationId}
            isManualGettingLink={!!step}
            invitationUrl={invitationUrl}
          />
        )}
      </div>
    </UserProvider>
  );
};

export default InviteDirectorPage;
