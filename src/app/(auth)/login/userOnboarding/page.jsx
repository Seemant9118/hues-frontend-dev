'use client';

import React, { useState } from 'react';
import UserOnboardingDetails from '../multi-step-forms/userOnboardingOTPComponents/UserOnboardingDetails';
import VerifyMailUser from '../multi-step-forms/userOnboardingOTPComponents/VerifyMailUser';

const UserOnboardingPage = () => {
  const [userOnboardingStep, setUserOnboardingStep] = useState(1);

  return (
    <div className="flex h-full items-center justify-center">
      {userOnboardingStep === 1 && (
        <UserOnboardingDetails setUserOnboardingStep={setUserOnboardingStep} />
      )}
      {userOnboardingStep === 2 && (
        <VerifyMailUser setUserOnboardingStep={setUserOnboardingStep} />
      )}
    </div>
  );
};

export default UserOnboardingPage;
