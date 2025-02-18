'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { SearchEnterprise } from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { requestExist } from '@/services/User_Auth_Service/UserAuthServices';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const EnterpriseOnboardPage = () => {
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
    setEnterpriseOnboardData((values) => ({ ...values, panNumber: panValue }));
    const errors = validatePanNumber(panValue);
    setErrorMsg(errors);

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

  const handleProceedWithExistingEnterprise = async (
    enterpriseID,
    isEnterpriseOnboardingComplete,
  ) => {
    LocalStorageService.set('enterpriseReqId', enterpriseID);

    const requestExistData = await queryClient.fetchQuery({
      queryKey: [userAuth.requestExist.endpointKey],
      queryFn: () => requestExist({ enterpriseId: enterpriseID }),
    });

    const hasUserRequestAccessToEnterprise = requestExistData?.data?.data;
    const isUserRequestIsApproved =
      requestExistData?.data?.data?.status === 'APPROVED';

    if (
      isEnterpriseOnboardingComplete &&
      hasUserRequestAccessToEnterprise &&
      isUserRequestIsApproved
    ) {
      const redirectUrl = LocalStorageService.get('redirectUrl');
      LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
      router.push(redirectUrl || '/');
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

  const handleBack = () => {
    router.push('/login/enterprise/select_enterprise');
  };

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              Onboard your Enterprise
            </h1>
            <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
              Enter all the details to unlock Hues completely
            </p>
          </div>

          <form className="grid w-full items-center gap-5">
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

              {(isSearchedDataLoading || isSearchedDataFetching) && <Loading />}
              {!isSearchedDataFetching && searchedData?.length > 0 && (
                <div className="flex items-center justify-between rounded-md border border-[#288AF9] p-2">
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#121212]">
                    {searchedData?.[0]?.name}
                  </span>
                  <Button
                    size="sm"
                    className="h-8 w-16 bg-[#288AF9]"
                    onClick={() =>
                      handleProceedWithExistingEnterprise(
                        searchedData?.[0]?.id,
                        searchedData?.[0]?.isOnboardingCompleted,
                      )
                    }
                  >
                    Proceed
                  </Button>
                </div>
              )}
              {!isSearchedDataFetching && searchedData?.length === 0 && (
                <div className="flex items-center justify-between rounded-md bg-[#288AF90A] p-2">
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
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </form>

          <div className="flex w-full flex-col gap-20">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft size={14} />
              Back
            </Button>
          </div>
        </div>
      </div>
    </UserProvider>
  );
};

export default EnterpriseOnboardPage;
