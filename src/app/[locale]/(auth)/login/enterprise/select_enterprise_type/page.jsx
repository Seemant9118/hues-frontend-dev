'use client';

import { validateEnterpriseType } from '@/appUtils/ValidationUtils';
import ExplantoryText from '@/components/auth/ExplantoryText';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import RadioSelect from '@/components/ui/RadioSelect';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const SelectEnterprisePage = () => {
  const translations = useTranslations('auth.enterprise.selectEnterprise');
  const translationsForError = useTranslations();
  const router = useRouter();
  const enterprisesType = [
    translations('enterpriseTypes.proprietorship'),
    translations('enterpriseTypes.partnership'),
    translations('enterpriseTypes.pvtLtd'),
    translations('enterpriseTypes.publicLtd'),
  ];

  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    type: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

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
    const errorMsg = validateEnterpriseType(enterpriseOnboardData.type);

    if (errorMsg) {
      setErrorMsg(errorMsg);
    } else {
      setErrorMsg('');
      router.push(
        `/login/enterprise/pan-verify?type=${enterpriseOnboardData.type}`,
      );
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[450px] flex-col items-center gap-8"
      >
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            {translations('heading')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('description')}
          </p>
        </div>
        <div className="grid w-full items-center gap-3">
          <div className="flex max-w-full flex-wrap gap-5">
            {enterprisesType.map((type) => (
              <RadioSelect
                key={type}
                name="enterpriseType"
                option={type}
                value={type?.toLowerCase()}
                checked={enterpriseOnboardData.type === type.toLowerCase()}
                handleChange={() => handleEnterpriseType(type.toLowerCase())}
              />
            ))}
          </div>
          {errorMsg && <ErrorBox msg={translationsForError(errorMsg)} />}
        </div>

        <div className="flex w-full flex-col gap-2">
          {/* Explanatory Information */}
          <ExplantoryText text={translations('information')} />
          <Button size="sm" type="submit" className="w-full bg-[#288AF9]">
            {translations('buttons.proceed')}
          </Button>

          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            {translations('buttons.back')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SelectEnterprisePage;
