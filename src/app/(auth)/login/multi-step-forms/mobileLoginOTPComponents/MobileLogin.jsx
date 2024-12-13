import { invitation } from '@/api/invitation/Invitation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { validationBase64 } from '@/services/Invitation_Service/Invitation_Service';
import {
  loginWithInvitation,
  userGenerateOtp,
} from '@/services/User_Auth_Service/UserAuthServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const MobileLogin = ({ setMobileLoginStep }) => {
  const [formDataWithMob, setFormDataWithMob] = useState({
    mobileNumber: '',
    countryCode: '+91',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();
  const invitationToken = searchParams.get('invitationToken');

  //  if invitation login flow then
  const {
    isLoading,
    data: inviteData,
    isSuccess,
  } = useQuery({
    queryKey: [invitation.validationBase64.endpointKey],
    queryFn: () => (invitationToken ? validationBase64(invitationToken) : ''),
    enabled: !!invitationToken,
    select: (data) => data.data.data,
  });

  useEffect(() => {
    if (isSuccess) {
      setFormDataWithMob((values) => ({
        ...values,
        mobileNumber: inviteData.mobile_number,
      }));
      LocalStorageService.set(
        'InvitationFromEnterpriseId',
        inviteData?.invitationData?.fromEnterprise,
      );
    }
  }, [isSuccess, inviteData]);

  // login with invitation
  const loginInvitation = useMutation({
    mutationFn: loginWithInvitation,
    onSuccess: (data) => {
      LocalStorageService.set('user_profile', data.data.data.userId);
      LocalStorageService.set('user_mobile_number', inviteData.mobile_number);
      LocalStorageService.set('operation_type', data.data.data.operation_type);
      LocalStorageService.set('invitationData', data.data.data.invitationData);
      toast.success(data.data.message);
      setMobileLoginStep(2); // verify mobile OTP
    },
    onError: () => {
      setErrorMsg('Failed to send OTP');
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => userGenerateOtp(data),
    onSuccess: (data) => {
      LocalStorageService.set('user_profile', data.data.data.userId);
      LocalStorageService.set(
        'user_mobile_number',
        formDataWithMob.mobileNumber,
      );
      LocalStorageService.set('operation_type', data.data.data.operation_type);
      LocalStorageService.set('invitationData', data.data.data.invitationData);
      toast.success(data.data.message);
      setMobileLoginStep(2);
    },
    onError: () => {
      setErrorMsg('Failed to send OTP');
    },
  });

  const handleChangeMobLogin = (e) => {
    const { name } = e.target;
    const { value } = e.target;
    // handle validation
    if (value.length !== 10) {
      setErrorMsg('*Please enter a 10 - digit mobile number');
    } else {
      setErrorMsg('');
    }
    setFormDataWithMob((values) => ({ ...values, [name]: value }));
  };

  const handleSubmitFormWithMob = (e) => {
    e.preventDefault();
    if (formDataWithMob.mobileNumber.length === 0) {
      setErrorMsg('Mobile Number is required to proceed');
    }
    if (!errorMsg) {
      if (!invitationToken) {
        mutation.mutate(formDataWithMob); // normal flow
      } else {
        loginInvitation.mutate({
          countryCode: inviteData.country_code,
          invitationPasscode: inviteData.invitation_passcode,
          invitationReferenceId: inviteData.invitation_reference_id,
          mobileNumber: formDataWithMob.mobileNumber,
          invitationType: inviteData?.invitationData?.invitationType,
        }); // invitation flow
      }
    }
  };

  return (
    <div className="flex h-[400px] w-[450px] flex-col items-center justify-start gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          Welcome to Hues
        </h1>
        <p className="w-full text-center text-sm text-[#A5ABBD]">
          One account for all things{' '}
          <span className="font-bold">Paraphernalia</span>
        </p>

        {isLoading && (
          <div className="flex flex-col">
            <span>Validating Invitation ...</span>
            <Loading />
          </div>
        )}
      </div>
      {/* login with mobile */}
      <form
        onSubmit={handleSubmitFormWithMob}
        className="grid w-full items-center gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="mobile-number" className="font-medium text-[#121212]">
            Phone number <span className="text-red-600">*</span>
          </Label>
          <div className="relative flex items-center hover:border-gray-600">
            <span className="absolute left-1.5 text-sm text-gray-600">+91</span>
            <Input
              type="text"
              name="mobileNumber"
              placeholder="Phone number"
              className="px-8 focus:font-bold"
              onChange={handleChangeMobLogin}
              value={formDataWithMob.mobileNumber}
            />
          </div>
          {errorMsg && (
            <span className="w-full px-1 text-sm font-semibold text-red-600">
              {errorMsg}
            </span>
          )}
        </div>

        <Button
          disabled={errorMsg || mutation.isPending}
          type="submit"
          size="sm"
          className="w-full rounded bg-[#288AF9] font-bold text-white hover:cursor-pointer"
        >
          {mutation.isPending ? (
            <Loading />
          ) : (
            <div className="flex items-center gap-4">
              <p>Send OTP</p>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MobileLogin;
