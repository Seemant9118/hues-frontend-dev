'use client';

import { directorApi } from '@/api/director/directorApi';
import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { directorInviteList } from '@/services/Director_Services/DirectorServices';
import { SearchEnterprise } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { requestExist } from '@/services/User_Auth_Service/UserAuthServices';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const SelectEnterprisePage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    panNumber: '',
  });
  const [errorMsg, setErrorMsg] = useState({});

  const validatePanNumber = (panNumber) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const error = {};

    if (panNumber === '') {
      error.panNumber = '*Required PAN Number';
    } else if (!panPattern.test(panNumber)) {
      error.panNumber = '* Please provide a valid PAN Number';
    }

    return error;
  };

  const handleChangePan = (e) => {
    const panValue = e.target.value.toUpperCase();
    setEnterpriseOnboardData((values) => ({
      ...values,
      panNumber: panValue,
    }));

    const errors = validatePanNumber(panValue);
    setErrorMsg(errors); // Update errorMsg based on validation result

    // Clear errorMsg if validation passes
    if (Object.keys(errors).length === 0) {
      setErrorMsg({});
    }
  };

  const {
    data: searchedData,
    isFetching: isSearchedDataFetching,
    isLoading: isSearchedDataLoading,
  } = useQuery({
    queryKey: [enterpriseUser.searchEnterprise.endpointKey],
    queryFn: () => SearchEnterprise(enterpriseOnboardData.panNumber, 'pan'),
    enabled:
      Object.keys(errorMsg).length === 0 &&
      enterpriseOnboardData.panNumber.length === 10,
    select: (data) => data.data.data,
  });

  // check by calling api : directorInviteList
  const { data: directorInviteListData, isLoading } = useQuery({
    queryKey: [directorApi.getDirectorInviteList.endpointKey],
    queryFn: directorInviteList,
    select: (data) => data?.data?.data,
  });

  const handleProccedWithEnterprise = (enterpriseId) => {
    LocalStorageService.set('enterpriseIdByDirectorInvite', enterpriseId);
    router.push('/login/enterpriseDetails');
  };

  // mutation call
  const handleProceedWithExistingEnterprise = async (
    enterpriseName,
    enterpriseID,
    isEnterpriseOnboardingComplete,
  ) => {
    // save enterpriseName to show in request access page
    LocalStorageService.set('enterpriseName', enterpriseName);
    LocalStorageService.set('enterpriseReqId', enterpriseID);

    // check by calling api : requestExistData
    const requestExistData = await queryClient.fetchQuery({
      queryKey: [userAuth.requestExist.endpointKey],
      queryFn: () =>
        requestExist({
          enterpriseId: enterpriseID,
        }),
    });

    const hasUserRequestAccessToEnterprise = requestExistData?.data?.data;
    const isUserRequestIsApproved =
      requestExistData?.data?.data?.status === 'APPROVED';

    // onSuccessEvent
    if (
      isEnterpriseOnboardingComplete &&
      hasUserRequestAccessToEnterprise &&
      isUserRequestIsApproved
    ) {
      router.push('/');
    } else if (
      (!isEnterpriseOnboardingComplete || isEnterpriseOnboardingComplete) &&
      hasUserRequestAccessToEnterprise &&
      !isUserRequestIsApproved
    ) {
      router.push('/login/requested_approval');
    } else {
      router.push('/login/request_access');
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Onboard Your Enterprise
          </h1>

          <p className="w-full text-center text-sm text-[#A5ABBD]">
            Enter your enterprise PAN to proceed further
          </p>
        </div>

        {/* api call to check all possible invites to director */}
        <div className="flex w-full flex-col gap-2">
          <span className="text-sm font-medium text-[#121212]">
            Select Enterprise
          </span>
          {isLoading && <Loading />}
          {!isLoading &&
            directorInviteListData?.length > 0 &&
            directorInviteListData.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border border-[#288AF9] p-2"
              >
                <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                  {item.fromEnterprise?.name}
                </span>

                <Button
                  size="sm"
                  className="h-8 w-16 bg-[#288AF9]"
                  onClick={() =>
                    handleProccedWithEnterprise(item.fromEnterprise?.id)
                  }
                >
                  Proceed
                </Button>
              </div>
            ))}

          {!isLoading && directorInviteListData?.length === 0 && (
            <div className="flex items-center justify-between rounded-sm bg-gray-100 p-2">
              <span className="flex items-center gap-1 text-sm text-[#121212]">
                <Info size={14} />
                No Director Invites Found
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-5">
          <span className="text-sm font-bold">Add a new Enterprise</span>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="mobile-number"
              className="font-medium text-[#121212]"
            >
              Enterprise PAN <span className="text-red-600">*</span>
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="pan"
                placeholder="ABCDE1234F"
                className="uppercase focus:font-bold"
                onChange={handleChangePan}
                value={enterpriseOnboardData.panNumber}
              />
            </div>
            {errorMsg.panNumber && (
              <span className="w-full px-1 text-sm font-semibold text-red-600">
                {errorMsg.panNumber}
              </span>
            )}
          </div>

          {(isSearchedDataLoading || isSearchedDataFetching) && <Loading />}
          {/* id enterprise found */}
          {!isSearchedDataFetching && searchedData?.length > 0 && (
            <div className="flex items-center justify-between rounded-sm border border-[#288AF9] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                {searchedData?.[0]?.name}
              </span>

              <Button
                size="sm"
                className="h-8 w-16 bg-[#288AF9]"
                onClick={() =>
                  handleProceedWithExistingEnterprise(
                    searchedData?.[0]?.name,
                    searchedData?.[0]?.id,
                    searchedData?.[0]?.isOnboardingCompleted,
                  )
                }
              >
                Proceed
              </Button>
            </div>
          )}
          {/* if enterprise not found */}
          {!isSearchedDataFetching && searchedData?.length === 0 && (
            <div className="flex items-center justify-between rounded-sm bg-[#288AF90A] p-2">
              <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                <Info size={14} />
                Enterprise Not Found
              </span>
              <Button
                size="sm"
                className="h-8 w-10 bg-[#288AF9]"
                onClick={() => {
                  router.push('/login/enterpriseDetails');
                  LocalStorageService.set(
                    'enterprisePanNumber',
                    enterpriseOnboardData.panNumber,
                  );
                }} // add enterprise details
              >
                Add
              </Button>
            </div>
          )}
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
        >
          Skip for Now
        </Link>
      </div>
    </div>
  );
};

export default SelectEnterprisePage;
