'use client';

import { UserProvider } from '@/context/UserContext';
import React, { useState } from 'react';
import AadharNumberDetail from '../multi-step-forms/aadharVerificationComponents/AadharNumberDetail';
import AadharVerifyOTP from '../multi-step-forms/aadharVerificationComponents/AadharVerifyOTP';

const AadharVerificationPage = () => {
  const [aadharVerificationSteps, setAadharVerificationSteps] = useState(1);
  const [aadharNumber, setAadharNumber] = useState('');

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        {aadharVerificationSteps === 1 && (
          <AadharNumberDetail
            aadharNumber={aadharNumber}
            setAadharNumber={setAadharNumber}
            setAadharVerificationSteps={setAadharVerificationSteps}
          />
        )}

        {aadharVerificationSteps === 2 && <AadharVerifyOTP />}
      </div>
    </UserProvider>
  );
};

export default AadharVerificationPage;
