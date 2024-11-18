'use client';

import { useState } from 'react';
import InviteDirectorIndexNew from '../multi-step-forms/inviteDirectorComponents/InviteDirectorIndexNew';
import ShareLinkToDirectorNew from '../multi-step-forms/inviteDirectorComponents/ShareLinkToDirectorNew';

const InviteDirectorPage = () => {
  const [directorInviteStep, setDirectorInviteStep] = useState(1);
  const [invitationUrl, setInvitationUrl] = useState('');

  return (
    <div className="flex h-full items-center justify-center">
      {directorInviteStep === 1 && (
        <InviteDirectorIndexNew
          setDirectorInviteStep={setDirectorInviteStep}
          setInvitationUrl={setInvitationUrl}
        />
      )}
      {directorInviteStep === 2 && (
        <ShareLinkToDirectorNew invitationUrl={invitationUrl} />
      )}
    </div>
  );
};

export default InviteDirectorPage;
