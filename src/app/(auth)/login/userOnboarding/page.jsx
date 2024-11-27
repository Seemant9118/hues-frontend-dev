'use client';

import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import React, { useState } from 'react';
import UserOnboardingDetails from '../multi-step-forms/userOnboardingOTPComponents/UserOnboardingDetails';
import VerifyMailUser from '../multi-step-forms/userOnboardingOTPComponents/VerifyMailUser';

const UserOnboardingPage = () => {
  const userID = LocalStorageService.get('user_profile');
  const [userOnboardingStep, setUserOnboardingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [userData, setUserData] = useState({
    userId: userID,
    name: '',
    email: '',
    dateOfBirth: '',
    panNumber: '',
    isTermsAndConditionApplied: false,
  });

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        {userOnboardingStep === 1 && (
          <UserOnboardingDetails
            setUserOnboardingStep={setUserOnboardingStep}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            userData={userData}
            setUserData={setUserData}
          />
        )}
        {userOnboardingStep === 2 && (
          <VerifyMailUser setUserOnboardingStep={setUserOnboardingStep} />
        )}
      </div>
    </UserProvider>
  );
};

export default UserOnboardingPage;
