'use client';

import { userAuth } from '@/api/user_auth/Users';
import ExplantoryText from '@/components/auth/ExplantoryText';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { udyamVerify } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const UdyamVerify = () => {
  const translations = useTranslations('auth.enterprise.udyamVerify');
  const router = useRouter();
  const type = LocalStorageService.get('type');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [isCheckedNotUdyam, setIsCheckedNotUdyam] = useState(false);
  const [enterpriseData, setEnterpriseData] = useState({
    udyamNumber: '',
    enterpriseId,
    type,
  });

  useEffect(() => {
    if (isCheckedNotUdyam) {
      setEnterpriseData((prev) => ({
        ...prev,
        udyamNumber: '',
      }));
    }
  }, [isCheckedNotUdyam]);

  const handleChange = (e) => {
    const { value } = e.target;
    setEnterpriseData((prev) => ({
      ...prev,
      udyamNumber: value,
    }));
  };

  const verifyUdyamMutation = useMutation({
    mutationKey: [userAuth.udyamVerify.endpointKey],
    mutationFn: udyamVerify, // Correct API function
    onSuccess: (data) => {
      toast.success(translations('toast.success'));

      const { enterpriseId } = data.data.data;
      LocalStorageService.set('enterprise_Id', enterpriseId);
      router.push('/login/enterprise/enterprise-verification-details');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || translations('toast.error'));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (enterpriseData.udyamNumber === '') {
      return router.push('/login/enterprise/enterprise-verification-details');
    }
    return verifyUdyamMutation.mutate(enterpriseData);
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            {translations('title')}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {translations('subtitle')}
          </p>
        </div>

        <form
          className="grid w-full items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="udyam" className="font-medium text-[#121212]">
              {translations('label')}
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="udyam"
                placeholder={translations('placeholder')}
                className="uppercase focus:font-bold"
                value={enterpriseData.udyamNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Explanatory Information */}
          <ExplantoryText text={translations('information')} />

          <div className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={isCheckedNotUdyam}
              onCheckedChange={() => setIsCheckedNotUdyam((prev) => !prev)}
            />
            <span className="cursor-pointer text-sm font-semibold">
              {translations('checkbox.text')}
            </span>
          </div>

          <Button
            size="sm"
            type="submit"
            disabled={
              verifyUdyamMutation.isPending ||
              (!isCheckedNotUdyam && !enterpriseData.udyamNumber.trim())
            }
          >
            {verifyUdyamMutation.isPending ? (
              <Loading />
            ) : (
              translations('button.proceed')
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={router.back}>
            <ArrowLeft size={14} />
            {translations('button.back')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UdyamVerify;
