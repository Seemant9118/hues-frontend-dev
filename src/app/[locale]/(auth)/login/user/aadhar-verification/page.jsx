'use client';

import { UserProvider } from '@/context/UserContext';
import React, { useEffect, useState } from 'react';
import AadharNumberDetail from '../../multi-step-forms/aadharVerificationComponents/AadharNumberDetail';
import AadharVerifyOTP from '../../multi-step-forms/aadharVerificationComponents/AadharVerifyOTP';

const AadharVerificationPage = () => {
  const [aadharVerificationSteps, setAadharVerificationSteps] = useState(1);
  const [aadharNumber, setAadharNumber] = useState('');
  const [verifyOTPdata, setVerifyOTPdata] = useState({
    tranId: '',
    aadhaar: '',
    otp: '',
  });

  // Keep verifyOTPdata.aadhar updated with the latest aadharNumber
  useEffect(() => {
    setVerifyOTPdata((prev) => ({
      ...prev,
      aadhaar: aadharNumber,
    }));
  }, [aadharNumber]);

  return (
    <UserProvider>
      <div className="flex h-full flex-col items-center justify-center">
        {aadharVerificationSteps === 1 && (
          <AadharNumberDetail
            aadharNumber={aadharNumber}
            setAadharNumber={setAadharNumber}
            setAadharVerificationSteps={setAadharVerificationSteps}
            setVerifyOTPdata={setVerifyOTPdata}
          />
        )}

        {aadharVerificationSteps === 2 && (
          <AadharVerifyOTP
            verifyOTPdata={verifyOTPdata}
            setVerifyOTPdata={setVerifyOTPdata}
          />
        )}
      </div>
    </UserProvider>
  );
};

export default AadharVerificationPage;
