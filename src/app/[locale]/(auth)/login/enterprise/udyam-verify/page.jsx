'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { udyamVerify } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const UdyamVerify = () => {
  const router = useRouter();
  const type = LocalStorageService.get('type');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [enterpriseData, setEnterpriseData] = useState({
    udyamNumber: '',
    enterpriseId,
    type,
  });

  const handleChange = (e) => {
    const { value } = e.target;
    setEnterpriseData((prev) => ({
      ...prev,
      udyamNumber: value,
    }));
  };

  const verifyUdyamMutation = useMutation({
    mutationKey: [userAuth.udyamVerify.endpointKey],
    mutationFn: udyamVerify,
    onSuccess: (data) => {
      toast.success('UDYAM ID Verified Successfully');

      const { enterpriseId } = data.data.data;
      LocalStorageService.set('enterprise_Id', enterpriseId);
      router.push('/login/enterprise/enterprise-verification-details');
    },
    onError: (error) => {
      toast.error(error.response.data.messages || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // api call
    if (enterpriseData.udyamNumber === '') {
      return router.push('/login/enterprise/enterprise-verification-details');
    } else {
      return verifyUdyamMutation.mutate(enterpriseData);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Verify your UDYAM ID
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Please enter the details and proceed
          </p>
        </div>

        <form
          className="grid w-full items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="cin" className="font-medium text-[#121212]">
              UDYAM ID
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="udyam"
                placeholder="Enter UDYAM ID"
                className="uppercase focus:font-bold"
                value={enterpriseData.udyamNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              size="sm"
              type="submit"
              disabled={verifyUdyamMutation.isPending}
            >
              {verifyUdyamMutation.isPending ? <Loading /> : 'Proceed'}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft size={14} />
              Back
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UdyamVerify;
