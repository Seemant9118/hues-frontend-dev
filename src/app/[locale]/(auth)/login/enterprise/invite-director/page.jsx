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
    if (!Number.isNaN(step) && step > 0) {
      // Ensure step is a valid number and greater than 0
      setDirectorInviteStep(step);
    }
  }, [step]); // Use step directly in the dependency array

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        {directorInviteStep === 1 ? (
          <InviteDirectorIndexNew
            setDirectorInviteStep={setDirectorInviteStep}
            setInvitationUrl={setInvitationUrl}
          />
        ) : (
          <ShareLinkToDirectorNew
            invitationId={invitationId}
            isManualGettingLink={!Number.isNaN(step)}
            invitationUrl={invitationUrl}
          />
        )}
      </div>
    </UserProvider>
  );
};

export default InviteDirectorPage;
