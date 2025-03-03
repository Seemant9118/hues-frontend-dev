'use client';

import { enterpriseUser } from '@/api/enterprises_user/Enterprises_users';
import { tokenApi } from '@/api/tokenApi/tokenApi';
import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import DatePickers from '@/components/ui/DatePickers';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import {
  getEnterpriseById,
  UpdateEnterprise,
} from '@/services/Enterprises_Users_Service/EnterprisesUsersService';
import { refreshToken } from '@/services/Token_Services/TokenServices';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

const EnterpriseVerificationDetailsPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [enterpriseOnboardData, setEnterpriseOnboardData] = React.useState({
    name: '',
    email: '',
    roa: '',
    roc: '',
    doi: '',
    type: '',
    panNumber: '',
    CIN: '',
  });
  const [errorMsg, setErrorMsg] = React.useState({});

  // fetch details
  const { data: enterpriseData } = useQuery({
    queryKey: [enterpriseUser.getEnterprise.endpointKey, enterpriseId],
    queryFn: () => getEnterpriseById(enterpriseId),
    enabled: !!enterpriseId,
    select: (data) => data?.data?.data,
    retry: (failureCount, error) => {
      return error.response.status === 401 || error.response.status === 403;
    },
  });

  // setDetails
  useEffect(() => {
    if (enterpriseData) {
      setEnterpriseOnboardData((prev) => ({
        ...prev,
        name: enterpriseData?.name || '',
        email: enterpriseData?.email || '',
        roa: enterpriseData?.address || '',
        roc: enterpriseData?.roc || '',
        doi: enterpriseData?.doi || '',
        type: enterpriseData?.type || '',
        panNumber: enterpriseData?.panNumber || '',
        CIN: enterpriseData?.cin || '',
      }));
    }
  }, [enterpriseData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnterpriseOnboardData((values) => ({ ...values, [name]: value }));
  };

  const handleDateChange = (date) => {
    setEnterpriseOnboardData((prev) => ({
      ...prev,
      doi: date ? date.toISOString().split('T')[0] : '',
    }));
  };

  const validation = (enterpriseOnboardD) => {
    const error = {};
    if (enterpriseOnboardD.name === '') {
      error.name = '*Required Enterprise Name';
    }
    if (enterpriseOnboardD.roa === '') {
      error.roa = '*Required Registered Office Address';
    }
    if (enterpriseOnboardD.doi === '') {
      error.doi = '*Required Date of Incorporation';
    }
    return error;
  };

  // mutation fn : update enterprise
  const enterpriseOnboardUpdateMutation = useMutation({
    mutationFn: UpdateEnterprise,
    onSuccess: async (data) => {
      // refreshToken
      const refreshTokenValue = await queryClient.fetchQuery({
        queryKey: [tokenApi.refreshToken.endpointKey],
        queryFn: refreshToken,
      });
      // set new access token
      const newAccessToken = refreshTokenValue?.data?.data?.access_token;
      LocalStorageService.set('token', newAccessToken);
      const { id, isOnboardingCompleted } = data.data.data;
      LocalStorageService.set('enterprise_Id', id);
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        isOnboardingCompleted,
      );

      // clear original data which was used in onboarding
      LocalStorageService.remove('companyData');
      LocalStorageService.remove('gst');

      toast.success('Enterprise Successfully Verified');

      router.push('/login/enterprise/enterprise-onboarded-success');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData) || {}; // Ensure it's always an object

    if (Object.keys(isError).length === 0) {
      setErrorMsg(null);
      enterpriseOnboardUpdateMutation.mutate({
        id: enterpriseId,
        data: enterpriseOnboardData,
      });
    } else {
      setErrorMsg(isError);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-start justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex w-[450px] flex-col items-center gap-10 py-2"
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
            {errorMsg?.name && <ErrorBox msg={errorMsg.name} />}
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
              Registered Office Address <span className="text-red-600">*</span>{' '}
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
              {errorMsg?.roa && <ErrorBox msg={errorMsg.roa} />}
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
              htmlFor="doi"
              className="flex items-center gap-1 font-medium text-[#414656]"
            >
              Date of Incorporation <span className="text-red-600">*</span>{' '}
              <Tooltips
                trigger={<Info size={12} />}
                content="Date of Incorporation"
              />
            </Label>

            <div className="relative">
              {enterpriseData?.doi ? (
                <Input
                  className="focus:font-bold"
                  type="text"
                  placeholder="Registration Date"
                  name="doi"
                  value={enterpriseOnboardData.doi}
                  disabled
                />
              ) : (
                <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <DatePickers
                    name="doi"
                    selected={
                      enterpriseOnboardData.doi
                        ? new Date(enterpriseOnboardData.doi)
                        : null
                    }
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy"
                    popperPlacement="bottom-end"
                  />
                </div>
              )}
            </div>
            {errorMsg?.doi && <ErrorBox msg={errorMsg.doi} />}
          </div>

          <div className="flex w-full flex-col gap-4">
            <Button size="sm" type="submit" className="w-full">
              {enterpriseOnboardUpdateMutation.isPending ? (
                <Loading />
              ) : (
                'Proceed'
              )}
            </Button>

            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft size={14} />
              Back
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EnterpriseVerificationDetailsPage;
