import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';

const AadharNumberDetail = ({
  aadharNumber,
  setAadharNumber,
  setAadharVerificationSteps,
}) => {
  const [errorMsg, setErrorMsg] = useState({});

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
      // api call then move to step 2
      setAadharVerificationSteps(2);
    }
    setErrorMsg(iserror);
  };

  return (
    <form
      onSubmit={handleProceed}
      className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
    >
      <div className="flex flex-col gap-2">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          Complete your profile
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
          disabled={aadharNumber?.length !== 12}
        >
          Proceed
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
