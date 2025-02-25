'use client';

import { Button } from '@/components/ui/button';
import RadioSelect from '@/components/ui/RadioSelect';
import { ArrowLeft } from 'lucide-react';
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
    type: '',
  });

  const handleEnterpriseType = (enterpriseType) => {
    setEnterpriseOnboardData((values) => ({
      ...values,
      type: enterpriseType,
    }));
  };

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(
      `/login/enterprise/pan-verify?type=${enterpriseOnboardData.type}`,
    );
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
      </form>
    </div>
  );
};

export default SelectEnterprisePage;
