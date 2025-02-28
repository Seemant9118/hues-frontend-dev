'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { cinVerify } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CINVerificationPage = () => {
  const router = useRouter();
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [enterpriseData, setEnterpriseData] = useState({
    cinOrLlpin: '',
    enterpriseId,
    userId,
  });

  // fetching cin from localStorage and set in states
  useEffect(() => {
    const cin =
      LocalStorageService.get('companyData')?.company_data?.cin ||
      LocalStorageService.get('companyData')?.cin ||
      LocalStorageService.get('companyData')?.cin_number;

    setEnterpriseData((prev) => ({
      ...prev,
      cinOrLlpin: cin,
    }));
  }, []);

  const verifyCINMutation = useMutation({
    mutationKey: [userAuth.cinVerify.mutationKey],
    mutationFn: cinVerify,
    onSuccess: (data) => {
      toast.success('CIN Verified Successfully');
      LocalStorageService.set('enterprise_Id', data?.data?.data?.enterpriseId);
      // LocalStorageService.set('gst', data?.data?.data?.gstData?.gstinResList);

      // if din matched
      if (data?.data?.data?.isDirector) {
        router.push('/login/enterprise/gst-verify');
      } else {
        router.push('/login/enterprise/invite-director');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.messages || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    verifyCINMutation.mutate(enterpriseData); // api call
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            We found a CIN for this enterpise
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Verify the CIN Number and continue
          </p>
        </div>

        <form
          className="grid w-full items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="cin" className="font-medium text-[#121212]">
              CIN
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="cin"
                placeholder="Enter your CIN number"
                className="uppercase focus:font-bold"
                value={enterpriseData.cinOrLlpin}
                disabled
              />
            </div>
          </div>

          <Button
            size="sm"
            type="submit"
            disabled={verifyCINMutation.isPending}
          >
            {verifyCINMutation.isPending ? <Loading /> : 'Verify'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            Back
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CINVerificationPage;
