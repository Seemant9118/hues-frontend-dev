'use client';

import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import DatePickers from '@/components/ui/DatePickers';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { userUpdate } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { Info } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PanVerificationPage = () => {
  const userID = LocalStorageService.get('user_profile');

  const [selectedDate, setSelectedDate] = useState(null);
  const [userData, setUserData] = useState({
    userId: userID,
    name: '',
    dateOfBirth: '',
    panNumber: '',
  });
  const [isPanFetched, setIsPanFetched] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  // dob set
  useEffect(() => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      dateOfBirth: selectedDate
        ? moment(selectedDate).format('DD/MM/YYYY')
        : '', // Update dynamically
    }));
  }, [selectedDate]);

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
        setIsPanFetched(false);
      } else {
        // Set error message if PAN is invalid
        setErrorMsg({
          ...errorMsg,
          panNumber: '',
        });
        // api call to fetch pan details
        setIsPanFetched(true); //  in response set pan details
      }
      setUserData((values) => ({ ...values, [name]: value.toUpperCase() }));

      return;
    }

    setUserData((values) => ({ ...values, [name]: value }));
  };

  // api mutation
  const mutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
      LocalStorageService.set(
        'isOnboardingComplete',
        data?.data?.data?.user?.isOnboardingComplete,
      );
      // state setting in localStrogeServices
      // and redirect according to it
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
      mutation.mutate(userData);
    }
    setErrorMsg(isAnyError);
  };

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <form
          onSubmit={handleProceed}
          className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md"
        >
          <div className="flex flex-col gap-2">
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
                {userData?.panNumber?.length === 10 && (
                  <div className="absolute right-1 top-0 flex h-full items-center justify-between bg-transparent p-1">
                    <span className="text-xs font-semibold text-gray-500">
                      Fetching details...
                    </span>
                    {/* <Loading /> */}
                  </div>
                )}
              </div>
              {errorMsg?.panNumber && <ErrorBox msg={errorMsg?.panNumber} />}
            </div>

            {/* if PAN details fetched then name and dob comes up */}
            {isPanFetched && (
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
                      onChange={handleChange}
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

                  <div className="relative flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <DatePickers
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      popperPlacement="bottom-end"
                    />
                  </div>
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
              disabled={userData?.length !== 10 || mutation.isPending}
            >
              {mutation.isPending ? <Loading /> : 'Proceed'}
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
