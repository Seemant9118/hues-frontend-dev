import { invitation } from '@/api/invitation/Invitation';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { validationBase64 } from '@/services/Invitation_Service/Invitation_Service';
import { loginWithInvitation } from '@/services/User_Auth_Service/UserAuthServices';
import { Label } from '@radix-ui/react-label';
import { useMutation, useQuery } from '@tanstack/react-query';
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
}) => {
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

  const validation = (formData) => {
    const error = {};
    if (formData.mobileNumber.length === 0) {
      error.mobileNumber = '*Phone Number is required to proceed';
    } else if (formData.mobileNumber.length !== 10) {
      error.mobileNumber = '*Please enter a 10 - digit phone number';
    }
    return error;
  };

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

  const handleChangeMobLogin = (e) => {
    const { name, value } = e.target;

    // Handle validation for 10-digit mobile number
    setErrorMsg((prev) => ({
      ...prev,
      mobileNumber:
        value.length === 10 ? '' : '*Please enter a 10-digit mobile number',
    }));

    // Update form data
    setFormDataWithMob((values) => ({
      ...values,
      [name]: value,
    }));
  };

  const handleSubmitFormWithMob = (e) => {
    e.preventDefault();
    const isAnyError = validation(formDataWithMob);

    if (Object.keys(isAnyError).length === 0) {
      setErrorMsg('');
      if (!invitationToken) {
        generateOTPMutation.mutate(formDataWithMob); // normal flow
      } else {
        loginInvitation.mutate({
          countryCode: inviteData.country_code,
          invitationPasscode: inviteData.invitation_passcode,
          invitationReferenceId: inviteData.invitation_reference_id,
          mobileNumber: formDataWithMob.mobileNumber,
          invitationType: inviteData?.invitationData?.invitationType,
        }); // invitation flow
      }
    } else {
      setErrorMsg(isAnyError);
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
              placeholder="Enter a Aadhar linked phone number"
              className="px-8 focus:font-bold"
              onChange={handleChangeMobLogin}
              value={formDataWithMob.mobileNumber}
            />
          </div>
          {errorMsg.mobileNumber && <ErrorBox msg={errorMsg.mobileNumber} />}
        </div>

        <Button
          disabled={generateOTPMutation.isPending}
          type="submit"
          size="sm"
          className="w-full rounded bg-[#288AF9] font-bold text-white hover:cursor-pointer"
        >
          {generateOTPMutation.isPending ? (
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
