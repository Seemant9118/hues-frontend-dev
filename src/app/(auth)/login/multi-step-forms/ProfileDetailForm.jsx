'use client';

import Tooltips from '@/components/auth/Tooltips';
import DatePickers from '@/components/ui/DatePickers';
import ErrorBox from '@/components/ui/ErrorBox';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import { userUpdate } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { CalendarDays, CreditCard, Info, UserRound } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ProfileDetailForm({
  setCurrStep,
  // params,
  // isThirdPartyLogin,
}) {
  const router = useRouter();
  const userID = LocalStorageService.get('user_profile');
  const isEnterpriseOnboardingComplete = LocalStorageService.get(
    'isEnterpriseOnboardingComplete',
  );
  const [selectedDate, setSelectedDate] = useState(null);

  const [userData, setUserData] = useState({
    userId: userID,
    name: '',
    email: '',
    dateOfBirth: '',
    panNumber: '',
  });

  const [errorMsg, setErrorMsg] = useState({});

  useEffect(() => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      dateOfBirth: selectedDate
        ? moment(selectedDate).format('DD/MM/YYYY')
        : '', // Update dynamically
    }));
  }, [selectedDate]);

  const mutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
      toast.success('Your Profile Completed & Verified');
      LocalStorageService.set(
        'isOnboardingComplete',
        data.data.data.user.isOnboardingComplete,
      );
      if (isEnterpriseOnboardingComplete) {
        router.push('/');
      } else {
        setCurrStep(4);
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

  const validation = (userDataItem) => {
    const error = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

    // Aadhaar validation
    // if (userData.aadhaar_number === "") {
    //   error.aadhaar_number = "* Required Aadhaar Number";
    // } else if (userData.aadhaar_number.length !== 4) {
    //   error.aadhaar_number = "* Please enter a last 4 digit of Aadhaar Number";
    // }

    // dateOfBirth validation
    // if (userData.dateOfBirth === "") {
    //   error.dateOfBirth = "*Required Date of Birth";
    // }

    // email validation
    if (userDataItem.email === '') {
      error.email = '*Required Email';
    } else if (!emailPattern.test(userData.email)) {
      error.email = '*Please provide valid email';
    }

    return error;
  };

  const handleChange = (e) => {
    const { name } = e.target;
    const { value } = e.target;

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

  const login = (e) => {
    e.preventDefault();
    const isAnyError = validation(userData);

    if (Object.keys(isAnyError).length === 0) {
      setErrorMsg({});
      mutation.mutate(userData);
    }
    setErrorMsg(isAnyError);
  };

  return (
    <>
      <form
        onSubmit={login}
        className="z-20 flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-3 rounded-md border border-[#E1E4ED] bg-white px-5 py-10"
      >
        <h1 className="w-full text-center text-2xl font-bold text-[#414656]">
          Complete your profile: unlock Hues
        </h1>
        {/* <p className="w-full text-xl text-[#414656] text-center">
          One account for all things <span className="font-bold">Hues</span>
        </p> */}

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="flex items-center gap-1 font-medium text-[#414656]"
          >
            Full Name <span className="text-red-600">*</span>{' '}
            <Tooltips trigger={<Info size={12} />} content="Your full Name" />
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
            <UserRound className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
          </div>
          {errorMsg?.name && <ErrorBox msg={errorMsg?.name} />}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="mobile-number"
            className="flex items-center gap-1 font-medium text-[#414656]"
          >
            Permanent Account Number <span className="text-red-600">*</span>{' '}
            <Tooltips
              trigger={<Info size={12} />}
              content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
            />
          </Label>
          <div className="relative">
            <Input
              // required={true}
              className="focus:font-bold"
              type="text"
              placeholder="FGHJ1456T"
              name="panNumber"
              value={userData.panNumber}
              onChange={handleChange}
            />
            <CreditCard className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
          </div>
          {errorMsg?.panNumber && <ErrorBox msg={errorMsg?.panNumber} />}
        </div>

        {/* {isThirdPartyLogin && (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="mobile-number" className="text-[#414656] font-medium flex items-center gap-1">
              Mobile Number  <span className="text-red-600">*</span> <Tooltips content="Mobile number: For OTP delivery, ensuring secure authentication and consent on Hues." />
            </Label>
            <div className="relative">
              <Input
                required={true}
                className="focus:font-bold"
                type="tel"
                placeholder="+91 987654321"
              />
              <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
          </div>
        )} */}
        {/* {!isThirdPartyLogin && (
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label
              htmlFor="mobile-number"
              className="text-[#414656] font-medium flex items-center gap-1"
            >
              Aadhaar Number <span className="text-red-600 ">*</span>{" "}
              <Tooltips
                trigger={<Info size={12} />}
                content="Aadhaar necessary to your profile"
              />
            </Label>
            <div className="relative">
              <span className="absolute text-gray-500 top-1/2 left-3 -translate-y-1/2">
                xxxx-xxxx-
              </span>
              <Input
                // required={true}
                className="focus:font-bold px-20"
                type="text"
                placeholder="____"
                name="aadhaar_number"
                value={userData.aadhaar_number}
                onChange={handleChange}
              />
              <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
            </div>
            {errorMsg?.aadhaar_number && (
              <ErrorBox msg={errorMsg?.aadhaar_number} />
            )}
          </div>
        )} */}

        <div className="grid w-full max-w-sm items-center gap-1.5">
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
              popperPlacement="top-right"
            />
            <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
          </div>
          {errorMsg?.dateOfBirth && <ErrorBox msg={errorMsg?.dateOfBirth} />}
        </div>

        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label
            htmlFor="email"
            className="flex items-center gap-1 font-medium text-[#414656]"
          >
            Email Address <span className="text-red-600">*</span>{' '}
            <Tooltips
              trigger={<Info size={12} />}
              content="Your email: The gateway to important Hues communications and document deliveries."
            />
          </Label>
          <div className="relative">
            <Input
              // required={true}
              className="focus:font-bold"
              type="text"
              placeholder="patrick@gmail.com*"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xl font-bold text-[#3F5575]">
              @
            </span>
          </div>
          {errorMsg?.email && <ErrorBox msg={errorMsg?.email} />}
        </div>
        <Button type="submit" className="w-full">
          {mutation.isPending ? <Loading /> : 'Submit'}
        </Button>

        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm text-slate-700 underline"
        >
          Skip for Now
        </Link>
      </form>

      {/* <div className="border">
        {isOnboardingdone && (
          <div className=" bg-white h-[300px] w-[600px] flex flex-col justify-center items-center gap-5 relative">
            <div className="absolute right-2 top-2 cursor-pointer" onClick={handleOnboardingEvent}><X /></div>
            <div className="rounded-full text-white bg-green-500 flex items-center justify-center p-2 max-w-fit">
              <Check />
            </div>
            <h1 className="text-4xl text-blue-500">Congratulations</h1>
            <p className="text-lg text-[#414656] ">You are Succcessfully Complete Your Profile</p>
          </div>
        )}
      </div> */}
    </>
  );
}
