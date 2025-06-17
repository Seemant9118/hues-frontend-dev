'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { Button } from '@/components/ui/button';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { getEnterpriseById } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

const RequestedApprovalPage = () => {
  const router = useRouter();
  const enterprisId = LocalStorageService.get('enterprise_Id');
  const enterpriseReqId = LocalStorageService.get('enterpriseReqId');

  const { data: enterpriseData } = useQuery({
    queryKey: [
      enterpriseUser.getEnterprise.endpointKey,
      enterpriseReqId ?? enterprisId,
    ],
    queryFn: () => getEnterpriseById(enterprisId),
    select: (data) => data?.data?.data,
    enabled: !!enterpriseReqId ?? !!enterprisId,
  });
  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
          <div className="flex flex-col gap-4">
            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              Request sent, Wait for approval
            </h1>
            <p className="w-full text-center text-sm text-[#A5ABBD]">
              Request sent to added as an associate at {enterpriseData?.name}
            </p>
          </div>

          <div className="flex w-full flex-col gap-5">
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

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center rounded-sm bg-gray-300 p-2 text-sm font-semibold text-[#121212] hover:underline"
          >
            Continue Anyway
          </Link>
        </div>
      </div>
    </UserProvider>
  );
};

export default RequestedApprovalPage;
