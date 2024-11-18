'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import Tooltips from '@/components/auth/Tooltips';
import ErrorBox from '@/components/ui/ErrorBox';
import RadioSelect from '@/components/ui/RadioSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import {
  getEnterpriseById,
  UpdateEnterprise,
} from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const VerifyEnterpriseDetails = () => {
  const enterpriseID = LocalStorageService.get('enterpriseIdByDirectorInvite');
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState({});
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: '',
    type: '',
    email: '',
    panNumber: '',
  });

  const { data: enterpriseData } = useQuery({
    queryKey: [enterpriseUser.getEnterprise.endpointKey, enterpriseID],
    queryFn: () => getEnterpriseById(enterpriseID),
    select: (data) => data?.data?.data,
    enabled: !!enterpriseID,
  });

  useEffect(() => {
    if (enterpriseData) {
      setEnterpriseOnboardData({
        name: enterpriseData.name || '',
        type: enterpriseData.type || '',
        email: enterpriseData.email || '',
        panNumber: enterpriseData.panNumber || '',
      });
    }
  }, [enterpriseData]);

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

  const validation = (data) => {
    const errors = {};
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    if (!data.name) errors.name = '*Required Enterprise Name';
    if (!data.panNumber) {
      errors.panNumber = '*Required PAN Number';
    } else if (!panPattern.test(data.panNumber)) {
      errors.panNumber = '*Please provide a valid PAN Number';
    }

    return errors;
  };

  const enterpriseOnboardMutation = useMutation({
    mutationFn: UpdateEnterprise,
    onSuccess: (data) => {
      LocalStorageService.set('enterprise_Id', data.data.data.id);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data.data.data.isOnboardingCompleted,
      );
      toast.success(data.data.message);
      if (enterpriseOnboardData.type === 'Proprietorship') {
        router.push('/');
      } else {
        router.push('/login/din');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

  const handleEnterpriseSubmit = (e) => {
    e.preventDefault();
    const errors = validation(enterpriseOnboardData);

    if (Object.keys(errors).length === 0) {
      setErrorMsg({});
      enterpriseOnboardMutation.mutate({
        id: enterpriseID,
        data: enterpriseOnboardData,
      });
    } else {
      setErrorMsg(errors);
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <form
        onSubmit={handleEnterpriseSubmit}
        className="flex h-[550px] w-[450px] flex-col items-center gap-10"
      >
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Verify Enterprise Information
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Enter all the details to unlock Hues completely
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="grid w-full items-center gap-1">
            <Label
              htmlFor="enterpriseName"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              Enterprise Name <span className="text-red-600">*</span>
              <Tooltips
                trigger={<Info size={12} />}
                content="Your Enterprise Name"
              />
            </Label>
            <Input
              className="focus:font-bold"
              type="text"
              placeholder="Enterprise Name"
              name="name"
              value={enterpriseOnboardData.name}
              onChange={handleChange}
            />
            {errorMsg.name && <ErrorBox msg={errorMsg.name} />}
          </div>

          <div className="grid w-full items-center gap-1">
            <Label
              htmlFor="enterprisePan"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              Enterprise PAN <span className="text-red-600">*</span>
              <Tooltips
                trigger={<Info size={12} />}
                content="Your Enterprise PAN"
              />
            </Label>
            <Input
              className="focus:font-bold"
              type="text"
              placeholder="Enterprise PAN"
              name="panNumber"
              value={enterpriseOnboardData.panNumber}
              onChange={handleChange}
            />
            {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
          </div>

          <div className="grid w-full items-center gap-1">
            <Label
              htmlFor="email"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              Email
              <Tooltips trigger={<Info size={12} />} content="Your Email" />
            </Label>
            <Input
              className="focus:font-bold"
              type="text"
              placeholder="enterprise@gmail.com"
              name="email"
              value={enterpriseOnboardData.email}
              onChange={handleChange}
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label
              htmlFor="enterpriseType"
              className="flex items-center font-medium text-[#414656]"
            >
              Enterprise Type <span className="text-red-600">*</span>
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
                  value={type.toLowerCase().replace(' ', '')}
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
              onClick={() => router.push('/login/select_enterprise')}
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
    </div>
  );
};

export default VerifyEnterpriseDetails;
