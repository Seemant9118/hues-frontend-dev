'use client';

import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const EnterpriseVerificationDetailsPage = () => {
  const router = useRouter();
  const [enterpriseOnboardData, setEnterpriseOnboardData] = React.useState({
    name: '',
    email: '',
    roa: '',
    roc: '',
    registrationDate: '',
  });
  const [errorMsg, setErrorMsg] = React.useState({});

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
      router.push('/login/enterprise/onboard_enterprise');
    } else {
      setErrorMsg(isError);
    }
  };

  return (
    <div className="flex h-full items-start justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[450px] flex-col items-center gap-10"
      >
        <div className="flex flex-col gap-2">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Verify your Enterprise Details
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Verify your enterprise and proceed further
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
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

          <div className="grid w-full items-center gap-1">
            <Label
              htmlFor="roa"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              Registered Office Address
              <Tooltips
                trigger={<Info size={12} />}
                content="Registered Office Address"
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder="Registered Office Address"
                name="roa"
                value={enterpriseOnboardData.roa}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid w-full items-center gap-1">
            <Label
              htmlFor="roc"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              ROC
              <Tooltips
                trigger={<Info size={12} />}
                content="Registrar of Companies"
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder="ROC"
                name="roc"
                value={enterpriseOnboardData.roc}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid w-full items-center gap-1">
            <Label
              htmlFor="registrationDate"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              Registration Date
              <Tooltips
                trigger={<Info size={12} />}
                content="Registration Date"
              />
            </Label>

            <div className="relative">
              <Input
                className="focus:font-bold"
                type="text"
                placeholder="Registration Date"
                name="registrationDate"
                value={enterpriseOnboardData.registrationDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
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

export default EnterpriseVerificationDetailsPage;
