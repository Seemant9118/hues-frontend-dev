'use client';

import Tooltips from '@/components/auth/Tooltips';
import ErrorBox from '@/components/ui/ErrorBox';
import RadioSelect from '@/components/ui/RadioSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const EnterpriseDetailsFirst = ({
  setEnterpriseDetailsCurrStep,
  enterpriseOnboardData,
  setEnterpriseOnboardData,
}) => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const enterpriseIdByDirectorInvite = LocalStorageService.get(
    'enterpriseIdByDirectorInvite',
  );
  const [errorMsg, setErrorMsg] = useState({});

  const handleEnterpriseType = (enterpriseType) => {
    setEnterpriseOnboardData((values) => ({
      ...values,
      type: enterpriseType,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnterpriseOnboardData((values) => ({ ...values, [name]: value }));
  };

  const validation = (enterpriseOnboardD) => {
    const error = {};
    if (enterpriseOnboardD.name === '') {
      error.enterpriseName = '*Required Enterprise Name';
    }
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData);

    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      setEnterpriseDetailsCurrStep(2); // next details page
    } else {
      setErrorMsg(isError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-[450px] flex-col items-center gap-10"
    >
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          {enterpriseId || enterpriseIdByDirectorInvite
            ? 'Verify your Enterprise Details'
            : 'Onboard your Enterprise'}
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          Enter all the details to unlock Hues completely{' '}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <div className="grid w-full items-center gap-1">
          <Label
            htmlFor="enterpriseName"
            className="flex items-center gap-1 font-medium text-[#414656]"
          >
            Enterprise Name <span className="text-red-600">*</span>{' '}
            <Tooltips
              trigger={<Info size={12} />}
              content="Your Enterprise Name"
            />
          </Label>

          <div className="relative">
            <Input
              className="focus:font-bold"
              type="text"
              placeholder="Enterprise Name"
              name="name"
              value={enterpriseOnboardData.name}
              onChange={handleChange}
            />
          </div>
          {errorMsg.enterpriseName && (
            <ErrorBox msg={errorMsg.enterpriseName} />
          )}
        </div>
        <div className="grid w-full items-center gap-1">
          <Label
            htmlFor="email"
            className="flex items-center gap-1 font-medium text-[#414656]"
          >
            Email
            <Tooltips trigger={<Info size={12} />} content="Your Email" />
          </Label>

          <div className="relative">
            <Input
              className="focus:font-bold"
              type="text"
              placeholder="enterprise@gmail.com"
              name="email"
              value={enterpriseOnboardData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* show selected radio */}
        <div className="grid w-full items-center gap-3">
          <Label
            htmlFor="enterpriseType"
            className="flex items-center font-medium text-[#414656]"
          >
            Enterprise Type <span className="text-red-600">*</span>{' '}
          </Label>
          <div className="flex max-w-full flex-wrap gap-5">
            {[
              'Proprietorship',
              'Partnership',
              'LLP',
              'Pvt Ltd',
              'Public Ltd',
            ].map((type) => (
              <RadioSelect
                key={type}
                name="enterpriseType"
                option={type}
                value={type.toLowerCase()}
                checked={enterpriseOnboardData.type === type.toLowerCase()}
                handleChange={() => handleEnterpriseType(type.toLowerCase())}
              />
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-10">
          <Button size="sm" type="submit" className="w-full bg-[#288AF9]">
            Proceed
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/login/enterpriseOnboardingSearch')} // PAN Search
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </div>
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

export default EnterpriseDetailsFirst;
