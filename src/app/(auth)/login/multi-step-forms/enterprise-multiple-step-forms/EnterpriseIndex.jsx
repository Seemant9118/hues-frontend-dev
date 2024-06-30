import ErrorBox from '@/components/ui/ErrorBox';
import RadioSelect from '@/components/ui/RadioSelect';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import React, { useState } from 'react';

const EnterpriseIndex = ({
  setEnterpriseCurrStep,
  enterpriseOnboardData,
  setEnterpriseOnboardData,
}) => {
  const [errorMsg, setErrorMsg] = useState({});

  const validation = (enterpriseOnboardD) => {
    const error = {};
    if (enterpriseOnboardD.type === '') {
      error.enterpriseType = '*Please select your enterprise type';
    }
    return error;
  };

  const handleEnterpriseType = (enterpriseType) => {
    setEnterpriseOnboardData((values) => ({
      ...values,
      type: enterpriseType,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData);

    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      setEnterpriseCurrStep(2);
    } else {
      setErrorMsg(isError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex min-h-[400px] w-[450px] flex-col items-center justify-between gap-4 rounded-md border border-[#E1E4ED] bg-white p-5"
    >
      <h1 className="w-full text-center text-2xl font-bold text-[#414656]">
        Enterprise Onboarding
      </h1>

      <div className="grid w-full max-w-md items-center gap-5">
        <Label
          htmlFor="enterpriseType"
          className="flex items-center font-medium text-[#414656]"
        >
          Select the option that best describes your enterprise{' '}
          <span className="text-red-600">*</span>{' '}
        </Label>
        <div className="flex flex-wrap gap-5">
          <RadioSelect
            name="enterpriseType"
            option={'Individual'}
            value="individual"
            handleChange={handleEnterpriseType}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Properitership'}
            value="properitership"
            handleChange={handleEnterpriseType}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Partnership'}
            value="partnership"
            handleChange={handleEnterpriseType}
          />
          <RadioSelect
            name="enterpriseType"
            option={'LLP'}
            value="llp"
            handleChange={handleEnterpriseType}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Private Limited Company'}
            value="privateLimited"
            handleChange={handleEnterpriseType}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Public Limited Company'}
            value="publicLimited"
            handleChange={handleEnterpriseType}
          />
        </div>
        {errorMsg.enterpriseType && <ErrorBox msg={errorMsg.enterpriseType} />}
      </div>
      <div className="flex w-full flex-col gap-4">
        <Button type="submit" className="w-full">
          {'Continue'}
        </Button>

        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm text-slate-700 underline"
        >
          Skip for Now
        </Link>
      </div>
    </form>
  );
};

export default EnterpriseIndex;
