'use client';

import { Button } from '@/components/ui/button';
import RadioSelect from '@/components/ui/RadioSelect';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const SelectEnterprisePage = () => {
  const router = useRouter();
  const enterprisesType = [
    'Proprietorship',
    'Partnership',
    'LLP',
    'Pvt Ltd',
    'Public Ltd',
  ];
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: '',
    type: '',
    email: '',
    panNumber: '',
    address: '',
    gstNumber: '',
    udyam: '',
    doi: '',
    isDeclerationConsent: null,
    LLPIN: '',
    CIN: '',
  });

  const handleEnterpriseType = (enterpriseType) => {
    setEnterpriseOnboardData((values) => ({
      ...values,
      type: enterpriseType,
    }));
  };

  const handleBack = () => {
    // if user onboarding already completed , then back to mobile login
    router.push('/login');
    // if user onboarding not completeted, then check which user onboarding step is pending and then visit back
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[450px] flex-col items-center gap-10"
      >
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Enterprise type
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Please select the category your enterprise belongs to
          </p>
        </div>
        <div className="grid w-full items-center gap-3">
          <div className="flex max-w-full flex-wrap gap-5">
            {enterprisesType.map((type) => (
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

          <Button variant="ghost" size="sm" onClick={handleBack}>
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
      </form>
    </div>
  );
};

export default SelectEnterprisePage;
