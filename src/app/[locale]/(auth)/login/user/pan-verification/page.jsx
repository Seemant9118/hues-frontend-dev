'use client';

import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { getPanDetails } from '@/services/User_Auth_Service/UserAuthServices';
import { useQuery } from '@tanstack/react-query';
import { Info, InfoIcon } from 'lucide-react';

import { userAuth } from '@/api/user_auth/Users';
import {
  validatePan,
  validateTermsAndConditions,
} from '@/appUtils/ValidationUtils';
import TermsAnsConditionModal from '@/components/Modals/TermsAndConditionModal';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthProgress } from '@/context/AuthProgressContext';
import { useUserData } from '@/context/UserDataContext';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import AuthProgress from '../../util-auth-components/AuthProgress';

const PanVerificationPage = () => {
  const translations = useTranslations('auth.userPanVerification');
  const translationsForError = useTranslations();
  const attemptsRemaining = LocalStorageService.get('attemptsRemaining');

  const { updateAuthProgress } = useAuthProgress(); // context
  const { userData, setUserData } = useUserData(); // context
  const router = useRouter();
  const [isTandCModalOpen, setIsTandCModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const onCheckedChangeTermsCondition = (checked) => {
    // Update form data
    setUserData((prev) => ({
      ...prev,
      isTermsAndConditionApplied: checked,
    }));

    // Handle error message based on the checkbox state
    setErrorMsg((prev) => ({
      ...prev,
      isTermsAndConditionApplied: checked ? '' : translations('tnc.error'),
    }));
  };

  // validation fn
  const validateForm = (userDataItem) => {
    const errors = {};
    errors.panNumber = validatePan(userDataItem.panNumber);
    errors.isTermsAndConditionApplied = validateTermsAndConditions(
      userDataItem.isTermsAndConditionApplied,
    );

    // Remove empty error messages
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    return errors;
  };

  // handleChange fn
  const handleChange = (e) => {
    const { name, value } = e.target;

    // pan validation
    if (name === 'panNumber') {
      setErrorMsg({
        ...errorMsg,
        panNumber: validatePan(value),
      });

      setUserData((values) => ({ ...values, [name]: value.toUpperCase() }));
      return;
    }

    setUserData((values) => ({ ...values, [name]: value }));
  };

  const formatDob = (dob) => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (dateRegex.test(dob)) {
      return dob;
    }
    const [day, month, year] = dob.split('-');
    return `${day}/${month}/${year}`;
  };

  const {
    data: panDetails,
    isLoading: isPanDetailsLoading,
    isFetching: isPanDetailsFetching,
    error: errorPanDetails,
  } = useQuery({
    queryKey: [userAuth.getPanDetails.endpointKey],
    queryFn: () => getPanDetails({ panNumber: userData.panNumber }),
    enabled:
      userData?.panNumber?.length === 10 &&
      userData?.isTermsAndConditionApplied,
    select: (data) => data?.data?.data,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      return error.response.status === 401;
    },
  });

  useEffect(() => {
    if (errorPanDetails) {
      setErrorMsg((prev) => ({
        ...prev,
        panNumber:
          errorPanDetails?.response?.data?.message ||
          translations('error.generic'),
      }));
    }
  }, [errorPanDetails]);

  useEffect(() => {
    if (panDetails) {
      setUserData((prevUserData) => ({
        ...prevUserData,
        panNumber: panDetails?.panNumber || prevUserData.panNumber,
        name: panDetails?.fullName || prevUserData.name,
        dateOfBirth: panDetails?.dob // Format `panDetails.dob` into 'DD/MM/YYYY'
          ? formatDob(panDetails?.dob)
          : prevUserData.dateOfBirth, // Retain existing value if no valid date is available
      }));
    }
  }, [panDetails]);

  // handleProceed fn
  const handleProceed = (e) => {
    e.preventDefault();
    const isAnyError = validateForm(userData);

    if (Object.keys(isAnyError).length === 0) {
      setErrorMsg({});
      // redirection
      router.push('/login/user/aadhar-verification');
      // saving user data fetching from pan
      LocalStorageService.set('enterpriseDetails', userData);
      // marked pan verified in context
      updateAuthProgress('isPanVerified', true);
    }
    setErrorMsg(isAnyError);
  };

  return (
    <UserProvider>
      <div className="flex h-full flex-col items-center pt-20">
        <form
          onSubmit={handleProceed}
          className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
        >
          <div className="flex flex-col gap-3">
            <AuthProgress isCurrAuthStep={'isPanVerificationStep'} />

            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              {translations('profile.title')}
            </h1>
            <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
              {translations('profile.subtitle')}
            </p>
          </div>

          <div className="flex w-full flex-col gap-6">
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="mobile-number"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                {translations('pan.label')}
                <span className="text-red-600">*</span>{' '}
                <Tooltips
                  trigger={<Info size={12} />}
                  content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
                />
              </Label>
              <div className="relative">
                <Input
                  // required={true}
                  className="pr-36 focus:font-bold"
                  type="text"
                  placeholder={translations('pan.placeholder')}
                  name="panNumber"
                  value={userData.panNumber}
                  onChange={handleChange}
                  disabled={attemptsRemaining === 0}
                />
                {/* if api is in pendingState then visible */}
                {(isPanDetailsLoading || isPanDetailsFetching) && (
                  <div className="absolute right-1 top-0 flex h-full items-center justify-between bg-transparent p-1">
                    <span className="text-xs font-semibold text-gray-500">
                      {translations('pan.fetching')}
                    </span>
                    {/* <Loading /> */}
                  </div>
                )}
              </div>
              {!isPanDetailsLoading && errorMsg?.panNumber && (
                <ErrorBox msg={translationsForError(errorMsg?.panNumber)} />
              )}

              {!errorMsg?.panNumber && (
                <div className="text-xs font-semibold">
                  {Math.max(
                    attemptsRemaining ?? 0,
                    panDetails?.remainingAttempts ?? 0,
                  ) > 0 ? (
                    <div className="flex items-center gap-1 text-primary">
                      <InfoIcon size={14} />
                      {translations('pan.attempts_remaining', {
                        count: attemptsRemaining,
                      })}
                      {/* {`You have ${panDetails?.remainingAttempts ?? attemptsRemaining ?? 0} attempts left to verify your PAN`} */}
                    </div>
                  ) : (
                    <div className="text-red-600">
                      {translations('pan.attempts_exhausted')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  disabled={attemptsRemaining === 0}
                  checked={userData.isTermsAndConditionApplied}
                  onCheckedChange={() => setIsTandCModalOpen(true)}
                />
                <div className="text-[#121212]">
                  {translations('tnc.checkbox_label')}{' '}
                  <span
                    className="cursor-pointer text-primary hover:underline"
                    onClick={() => setIsTandCModalOpen(true)}
                  >
                    {translations('tnc.link')}
                  </span>
                  <TermsAnsConditionModal
                    isOpen={isTandCModalOpen}
                    onClose={() => setIsTandCModalOpen(false)} // Close modal without changing state
                    onDecline={() => {
                      onCheckedChangeTermsCondition(false); // Update checkbox state
                      setIsTandCModalOpen(false); // Close modal
                    }}
                    onAgree={() => {
                      onCheckedChangeTermsCondition(true); // Update checkbox state
                      setIsTandCModalOpen(false); // Close modal
                    }}
                  />
                </div>
              </div>
              {errorMsg?.isTermsAndConditionApplied && (
                <ErrorBox
                  msg={translationsForError(
                    errorMsg?.isTermsAndConditionApplied,
                  )}
                />
              )}
            </div>

            {/* if PAN details fetched then name and dob comes up */}
            {userData?.panNumber?.length === 10 && panDetails && (
              <>
                <div className="grid w-full items-center gap-1.5">
                  <Label
                    htmlFor="mobile-number"
                    className="flex items-center gap-1 font-medium text-[#414656]"
                  >
                    {translations('name.label')}{' '}
                    <span className="text-red-600">*</span>{' '}
                    <Tooltips
                      trigger={<Info size={12} />}
                      content="Your full Name"
                    />
                  </Label>

                  <div className="relative">
                    <Input
                      // required={true}
                      className="focus:font-bold"
                      type="text"
                      placeholder={translations('name.tooltip')}
                      name="name"
                      value={userData.name}
                      disabled
                    />
                  </div>
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label
                    htmlFor="dob"
                    className="flex items-center gap-1 font-medium text-[#414656]"
                  >
                    {translations('dob.label')}{' '}
                    <span className="text-red-600">*</span>{' '}
                    <Tooltips
                      trigger={<Info size={12} />}
                      content={translations('dob.tooltip')}
                    />
                  </Label>

                  <Input
                    // required={true}
                    className="focus:font-bold"
                    type="text"
                    placeholder="dd/MM/yyyy"
                    name="name"
                    value={userData.dateOfBirth}
                    disabled
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={
                errorPanDetails ||
                isPanDetailsLoading ||
                isPanDetailsFetching ||
                attemptsRemaining === 0
              }
            >
              {isPanDetailsLoading || isPanDetailsFetching ? (
                <Loading />
              ) : (
                translations('actions.proceed')
              )}
            </Button>
          </div>
        </form>
      </div>
    </UserProvider>
  );
};

export default PanVerificationPage;
