'use client';

import { userAuth } from '@/api/user_auth/Users';
import { UserProvider } from '@/context/UserContext';
import { sentAadharOTP } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
  const [startFrom, setStartFrom] = useState(59);

  // Keep verifyOTPdata.aadhar updated with the latest aadharNumber
  useEffect(() => {
    setVerifyOTPdata((prev) => ({
      ...prev,
      aadhaar: aadharNumber,
    }));
  }, [aadharNumber]);

  const sendAadharOTPMutation = useMutation({
    mutationKey: [userAuth.sendAadharVerificationOTP.endpointKey],
    mutationFn: sentAadharOTP,
    onSuccess: (data) => {
      if (data) {
        toast.success('OTP sent successfully');
        setStartFrom(59);
        setVerifyOTPdata((prev) => ({
          ...prev,
          tranId: data?.data?.data?.data?.tran_id,
        }));
        setAadharVerificationSteps(2); // move to next step - verify oTP
      } else {
        toast.info('Please try after some time, server is not responding');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  return (
    <UserProvider>
      <div className="flex h-full flex-col items-center justify-center">
        {aadharVerificationSteps === 1 && (
          <AadharNumberDetail
            aadharNumber={aadharNumber}
            setAadharNumber={setAadharNumber}
            sendAadharOTPMutation={sendAadharOTPMutation}
          />
        )}

        {aadharVerificationSteps === 2 && (
          <AadharVerifyOTP
            aadharNumber={aadharNumber}
            verifyOTPdata={verifyOTPdata}
            setVerifyOTPdata={setVerifyOTPdata}
            sendAadharOTPMutation={sendAadharOTPMutation}
            startFrom={startFrom}
            setStartFrom={setStartFrom}
          />
        )}
      </div>
    </UserProvider>
  );
};

export default AadharVerificationPage;
