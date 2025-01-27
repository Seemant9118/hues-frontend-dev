'use client';

import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import {
  getPanDetails,
  userUpdate,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import Link from 'next/link';

import { userAuth } from '@/api/user_auth/Users';
import TermsAnsConditionModal from '@/components/Modals/TermsAndConditionModal';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthProgress } from '@/context/AuthProgressContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import AuthProgress from '../util-auth-components/AuthProgress';

const PanVerificationPage = () => {
  const userID = LocalStorageService.get('user_profile');

  const { updateAuthProgress } = useAuthProgress();

  const router = useRouter();
  const [isTandCModalOpen, setIsTandCModalOpen] = useState(false);
  const [userData, setUserData] = useState({
    userId: userID,
    name: '',
    dateOfBirth: '',
    panNumber: '',
    isTermsAndConditionApplied: false,
  });
  const [errorMsg, setErrorMsg] = useState({});

  const onCheckedChangeTermsCondition = (checked) => {
    // Update form data
    setUserData((prev) => ({
      ...prev,
      isTermsAndConditionApplied: checked,
    }));

    // Handle error message based on the checkbox state
    setErrorMsg((prev) => ({
      ...prev,
      isTermsAndConditionApplied: checked
        ? ''
        : '*Please accept the terms and conditions',
    }));
  };

  // validation fn
  const validation = (userDataItem) => {
    const error = {};
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

    // name validation
    if (userDataItem.name === '') {
      error.name = '*Required Full Name';
    }
    // pan validation
    if (userDataItem.panNumber === '') {
      error.panNumber = '*Required PAN Number';
    } else if (!panPattern.test(userData.panNumber)) {
      error.panNumber = '* Please provide valid PAN Number';
    }
    // dateOfBirth validation
    if (userData.dateOfBirth === '') {
      error.dateOfBirth = '*Required Date of Birth';
    }

    // terms and condition validation
    if (!userData.isTermsAndConditionApplied) {
      error.isTermsAndConditionApplied =
        '*Please accept the terms and conditions';
    }

    return error;
  };

  // handleChange fn
  const handleChange = (e) => {
    const { name, value } = e.target;

    // pan validation
    if (name === 'panNumber') {
      const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
      if (!panPattern.test(value) && value.length !== 10) {
        // Reset error message if PAN is valid
        setErrorMsg({
          ...errorMsg,
          panNumber: '* Please provide valid PAN Number',
        });
      } else {
        // Set error message if PAN is invalid
        setErrorMsg({
          ...errorMsg,
          panNumber: '',
        });
      }
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
    error: errorPanDetails,
  } = useQuery({
    queryKey: [userAuth.getPanDetails.endpointKey],
    queryFn: () => getPanDetails({ panNumber: userData.panNumber }),
    enabled:
      userData?.panNumber?.length === 10 &&
      userData?.isTermsAndConditionApplied,
    select: (data) => data.data.data,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (errorPanDetails) {
      setErrorMsg((prev) => ({
        ...prev,
        panNumber:
          errorPanDetails?.response?.data?.message ||
          'Oops, Something went wrong!',
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

  // api mutation
  const userUpdatemutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
      LocalStorageService.set(
        'isOnboardingComplete',
        data?.data?.data?.user?.isOnboardingComplete,
      );
      LocalStorageService.set(
        'isPanVerified',
        data?.data?.data?.user?.isPanVerified,
      );
      LocalStorageService.set(
        'isAadhaarVerified',
        data?.data?.data?.user?.isAadhaarVerified,
      );
      LocalStorageService.set(
        'isEmailVerified',
        data?.data?.data?.user?.isEmailVerified,
      );
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data?.data?.data?.user?.isEnterpriseOnboardingComplete,
      );

      // marked pan verified in context
      updateAuthProgress('isPanVerified', true);

      // redirection
      router.push('/login/aadhar-verification');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

  // handleProceed fn
  const handleProceed = (e) => {
    e.preventDefault();
    const isAnyError = validation(userData);

    if (Object.keys(isAnyError).length === 0) {
      setErrorMsg({});
      userUpdatemutation.mutate(userData);
    }
    setErrorMsg(isAnyError);
  };

  return (
    <UserProvider>
      <div className="flex h-full flex-col items-center justify-center border">
        <form
          onSubmit={handleProceed}
          className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
        >
          <div className="flex flex-col gap-3">
            <AuthProgress isCurrAuthStep={'isPanVerificationStep'} />

            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              Complete your profile
            </h1>
            <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
              Enter all the details to unlock Hues completely
            </p>
          </div>

          <div className="flex w-full flex-col gap-6">
            <div className="grid w-full items-center gap-1.5">
              <Label
                htmlFor="mobile-number"
                className="flex items-center gap-1 font-medium text-[#414656]"
              >
                PAN <span className="text-red-600">*</span>{' '}
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
                  placeholder="PAN Card Number"
                  name="panNumber"
                  value={userData.panNumber}
                  onChange={handleChange}
                />
                {/* if api is in pendingState then visible */}
                {userData?.panNumber?.length === 10 && isPanDetailsLoading && (
                  <div className="absolute right-1 top-0 flex h-full items-center justify-between bg-transparent p-1">
                    <span className="text-xs font-semibold text-gray-500">
                      Fetching details...
                    </span>
                    {/* <Loading /> */}
                  </div>
                )}
              </div>
              {!isPanDetailsLoading && errorMsg?.panNumber && (
                <ErrorBox msg={errorMsg?.panNumber} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={userData.isTermsAndConditionApplied}
                  onCheckedChange={() => setIsTandCModalOpen(true)}
                />
                <div className="text-[#121212]">
                  By selecting this box, I agree to all the{' '}
                  <span
                    className="cursor-pointer text-primary hover:underline"
                    onClick={() => setIsTandCModalOpen(true)}
                  >
                    Terms and Conditions
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
                <ErrorBox msg={errorMsg?.isTermsAndConditionApplied} />
              )}
            </div>

            {/* if PAN details fetched then name and dob comes up */}
            {panDetails && (
              <>
                <div className="grid w-full items-center gap-1.5">
                  <Label
                    htmlFor="mobile-number"
                    className="flex items-center gap-1 font-medium text-[#414656]"
                  >
                    Full Name <span className="text-red-600">*</span>{' '}
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
                      placeholder="Full Name"
                      name="name"
                      value={userData.name}
                      disabled
                    />
                  </div>
                  {errorMsg?.name && <ErrorBox msg={errorMsg?.name} />}
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label
                    htmlFor="dob"
                    className="flex items-center gap-1 font-medium text-[#414656]"
                  >
                    Date of Birth <span className="text-red-600">*</span>{' '}
                    <Tooltips
                      trigger={<Info size={12} />}
                      content="Hues requires age verification for secure transactions, ensuring a trustworthy user experience."
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

                  {errorMsg?.dateOfBirth && (
                    <ErrorBox msg={errorMsg?.dateOfBirth} />
                  )}
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              size="sm"
              disabled={userUpdatemutation.isPending}
            >
              {userUpdatemutation.isPending ? <Loading /> : 'Proceed'}
            </Button>

            <Link
              href="/"
              className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
            >
              Skip for Now
            </Link>
          </div>
        </form>
      </div>
    </UserProvider>
  );
};

export default PanVerificationPage;
