import { invitation } from '@/api/invitation/Invitation';
import { userAuth } from '@/api/user_auth/Users';
import { validatePhoneNumber } from '@/appUtils/ValidationUtils';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { validationBase64 } from '@/services/Invitation_Service/Invitation_Service';
import { loginWithInvitation } from '@/services/User_Auth_Service/UserAuthServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

const MobileLogin = ({
  setMobileLoginStep,
  formDataWithMob,
  setFormDataWithMob,
  errorMsg,
  setErrorMsg,
  generateOTPMutation,
  translations,
}) => {
  const translationForErrorMessages = useTranslations();
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
      // LocalStorageService.set('invitationData', inviteData?.invitationData);
    }
  }, [isSuccess, inviteData]);

  // login with invitation
  const loginInvitation = useMutation({
    mutationKey: [userAuth.loginWithInvitation.endpointKey],
    mutationFn: loginWithInvitation,
    onSuccess: (data) => {
      LocalStorageService.set('user_profile', data.data.data.userId);
      LocalStorageService.set('user_mobile_number', inviteData.mobile_number);
      LocalStorageService.set('operation_type', data.data.data.operation_type);
      LocalStorageService.set('invitationData', data.data.data.invitationData);
      toast.success(translations('toast.otpSent'));
      setMobileLoginStep(2); // verify mobile OTP
    },
    onError: () => {
      setErrorMsg(translations('toast.failedToSendOtp'));
    },
  });

  const handleChangeMobLogin = (e) => {
    const { name, value } = e.target;

    // Validate mobile number and update error message
    const errorMessage = validatePhoneNumber(value);
    setErrorMsg(errorMessage);

    // Update form data
    setFormDataWithMob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitFormWithMob = (e) => {
    e.preventDefault();

    const errorMsg = validatePhoneNumber(formDataWithMob.mobileNumber);

    if (!errorMsg) {
      setErrorMsg('');

      if (!invitationToken) {
        // Normal flow
        generateOTPMutation.mutate(formDataWithMob);
      } else {
        // Invitation flow
        loginInvitation.mutate({
          countryCode: inviteData?.country_code,
          invitationPasscode: inviteData?.invitation_passcode,
          invitationReferenceId: inviteData?.invitation_reference_id,
          mobileNumber: formDataWithMob.mobileNumber,
          invitationType: inviteData?.invitationData?.invitationType,
        });
      }
    } else {
      setErrorMsg(errorMsg);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-start gap-4 sm:gap-6">
      {/* Title and Subtitle */}
      <div className="flex w-full flex-col gap-4">
        <h1 className="text-center text-2xl font-bold text-[#121212]">
          {translations('header.title')}
        </h1>
        <p className="text-center text-sm text-[#A5ABBD]">
          {translations('header.subtitle')}{' '}
          <span className="font-bold">{translations('header.brandName')}</span>
        </p>

        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <span>{translations('validation.invitationLoading')}</span>
            <Loading />
          </div>
        )}
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleSubmitFormWithMob}
        className="grid w-full items-center gap-3"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="mobile-number" className="font-medium text-[#121212]">
            {translations('form.phoneLabel')}{' '}
            <span className="text-red-600">*</span>
          </Label>
          <div className="relative flex items-center hover:border-gray-600">
            <span className="absolute left-2 text-sm text-gray-600">+91</span>
            <Input
              type="number"
              name="mobileNumber"
              placeholder={translations('form.phonePlaceholder')}
              className="w-full py-2 pl-10 pr-3 focus:font-bold"
              onChange={handleChangeMobLogin}
              value={formDataWithMob.mobileNumber}
            />
          </div>
          {errorMsg && <ErrorBox msg={translationForErrorMessages(errorMsg)} />}
        </div>

        <Button
          disabled={generateOTPMutation.isPending || loginInvitation.isPending}
          type="submit"
          size="sm"
          className="w-full rounded bg-[#288AF9] font-bold text-white hover:cursor-pointer"
        >
          {generateOTPMutation.isPending || loginInvitation.isPending ? (
            <Loading />
          ) : (
            <div className="flex items-center justify-center gap-2">
              <p>{translations('button.sendOtp')}</p>
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};

export default MobileLogin;
