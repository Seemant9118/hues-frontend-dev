import { validateAadhaar } from '@/appUtils/ValidationUtils';
import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { Info } from 'lucide-react';
import React, { useState } from 'react';
import AuthProgress from '../../util-auth-components/AuthProgress';

const AadharNumberDetail = ({
  aadharNumber,
  setAadharNumber,
  sendAadharOTPMutation,
}) => {
  const [errorMsg, setErrorMsg] = useState(null);

  // validation fn
  const validation = (aadharNumber) => {
    const errors = {};
    errors.aadharNumber = validateAadhaar(aadharNumber);

    // Remove empty error messages
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    return errors;
  };

  const handleChange = (e) => {
    const { value } = e.target;

    setErrorMsg({
      ...errorMsg,
      aadharNumber: validateAadhaar(value),
    });

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
        <AuthProgress isCurrAuthStep={'isAadharVerificationStep'} />
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
          disabled={sendAadharOTPMutation.isPending}
        >
          {sendAadharOTPMutation.isPending ? <Loading /> : 'Proceed'}
        </Button>
      </div>
    </form>
  );
};

export default AadharNumberDetail;
