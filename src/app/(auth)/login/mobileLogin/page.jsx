'use client';

import React, { useState } from 'react';
import MobileLogin from '../multi-step-forms/mobileLoginOTPComponents/MobileLogin';
import VerifyMobileOTP from '../multi-step-forms/mobileLoginOTPComponents/VerifyMobileOTP';

const MobileLoginPage = () => {
  const [mobileLoginStep, setMobileLoginStep] = useState(1);

  return (
    <div className="flex h-full items-center justify-center">
      {mobileLoginStep === 1 && (
        <MobileLogin setMobileLoginStep={setMobileLoginStep} />
      )}
      {mobileLoginStep === 2 && (
        <VerifyMobileOTP setMobileLoginStep={setMobileLoginStep} />
      )}
    </div>
  );
};

export default MobileLoginPage;
