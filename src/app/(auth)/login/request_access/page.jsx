'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import { createRequestAccess } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const RequestAccessPage = () => {
  const router = useRouter();
  const enterpriseName = LocalStorageService.get('enterpriseName');
  const enterpriseReqId = LocalStorageService.get('enterpriseReqId');

  const createRequestAccessMutation = useMutation({
    mutationKey: [userAuth.createRequestAccess.endpointKey, enterpriseReqId],
    mutationFn: createRequestAccess,
    onSuccess: () => {
      toast.success(`Request sent to ${enterpriseName}`);
      router.push('/login/requested_approval');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleRequestApiSuccess = () => {
    createRequestAccessMutation.mutate({
      enterpriseId: enterpriseReqId,
    });
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            You are not added as an associate at {enterpriseName}
          </h1>
          <p className="w-full text-center text-sm text-[#A5ABBD]">
            Request the enterprise to add you as an associate
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          <Button
            size="sm"
            type="Submit"
            className="w-full bg-[#288AF9] p-2"
            onClick={handleRequestApiSuccess}
          >
            Request Access
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full p-2"
            onClick={() => router.push('/login/enterpriseOnboardingSearch')}
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </div>

        <div className="flex w-full flex-col gap-14">
          <Link
            href="/"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            Skip for Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessPage;
