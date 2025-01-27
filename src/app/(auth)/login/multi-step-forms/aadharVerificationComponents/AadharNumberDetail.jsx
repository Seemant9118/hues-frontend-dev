import { userAuth } from '@/api/user_auth/Users';
import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { sentAadharOTP } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'sonner';
import AuthProgress from '../../util-auth-components/AuthProgress';

const AadharNumberDetail = ({
  aadharNumber,
  setAadharNumber,
  setAadharVerificationSteps,
  setVerifyOTPdata,
}) => {
  const [errorMsg, setErrorMsg] = useState({});

  // validation fn
  const validation = (aadharNumber) => {
    let error = {};
    const aadharPattern = /^\d{12}$/;

    if (aadharNumber === '') {
      error.aadharNumber = '*Required Aadhar Number';
    } else if (!aadharPattern.test(aadharNumber)) {
      error.aadharNumber = '* Please provide valid Aadhar Number';
    } else {
      error = {};
    }

    return error;
  };

  const sendAadharOTPMutation = useMutation({
    mutationKey: [userAuth.sendAadharVerificationOTP.endpointKey],
    mutationFn: sentAadharOTP,
    onSuccess: (data) => {
      if (data) {
        toast.success('OTP sent successfully');
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

  const handleChange = (e) => {
    const { value } = e.target;

    if (value?.length !== 12) {
      setErrorMsg({ aadharNumber: 'Aadhar number should be 12 digits' });
    } else {
      setErrorMsg({});
    }
    setAadharNumber(value);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    // api call
    const iserror = validation(aadharNumber);

    if (Object.keys(iserror).length === 0) {
      sendAadharOTPMutation.mutate({ aadhaar: aadharNumber });
    }
    setErrorMsg(iserror);
  };

  return (
    <form
      onSubmit={handleProceed}
      className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
    >
      <div className="flex flex-col gap-3">
        <AuthProgress />
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          Verify your Aadhar
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          Enter all the details to unlock Hues completely
        </p>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="grid w-full items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="flex items-center gap-1 font-medium text-[#414656]"
          >
            Aadhar <span className="text-red-600">*</span>{' '}
            <Tooltips
              trigger={<Info size={12} />}
              content="Aadhar: Your universal legal identifier for all government and financial interactions on Hues."
            />
          </Label>
          <div className="relative">
            <Input
              // required={true}
              className="pr-36 focus:font-bold"
              type="text"
              placeholder="Aadhar Card Number"
              name="aadharNumber"
              value={aadharNumber}
              onChange={handleChange}
            />
          </div>
          {errorMsg?.aadharNumber && <ErrorBox msg={errorMsg?.aadharNumber} />}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="sm"
          disabled={
            aadharNumber?.length !== 12 || sendAadharOTPMutation.isPending
          }
        >
          {sendAadharOTPMutation.isPending ? <Loading /> : 'Proceed'}
        </Button>

        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
        >
          Skip for Now
        </Link>
      </div>
    </form>
  );
};

export default AadharNumberDetail;
