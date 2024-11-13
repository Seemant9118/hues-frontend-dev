import Tooltips from '@/components/auth/Tooltips';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import DatePickers from '@/components/ui/DatePickers';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { userUpdate } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Info } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const UserOnboardingDetails = ({ setUserOnboardingStep }) => {
  const router = useRouter();
  const userID = LocalStorageService.get('user_profile');

  const [selectedDate, setSelectedDate] = useState(null);

  const [userData, setUserData] = useState({
    userId: userID,
    name: '',
    email: '',
    dateOfBirth: '',
    panNumber: '',
    isTermsAndConditionApplied: false,
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

  const erpCommunication = (res, lang) => {
    const message = {
      successMessage: '',
      errorMessage: '',
    };

    // Handle case if an error occurs
    if (res.response.data.status === false) {
      switch (res.response.data.message) {
        // In User Onboarding , PAN Alreadt exist
        case 'USER_ONBOARDING_DUPLICATE_PAN_ERROR':
          switch (lang) {
            case 'en-IN':
              message.errorMessage = 'User already exists with this PAN number';
              break;
            case 'hindi':
              message.errorMessage = 'यह पैन नंबर पहले से मौजूद है';
              break;
            // Add more cases for other languages as needed
            default:
              message.errorMessage = 'User already exists with this PAN number';
          }
          break;
        // Handle other specific error messages here if needed
        default:
          message.errorMessage = res.response.data.message;
      }
    }

    return message;
  };

  const mutation = useMutation({
    mutationFn: (data) => userUpdate(data),
    onSuccess: (data) => {
      toast.success('OTP Sent');
      LocalStorageService.set(
        'isOnboardingComplete',
        data.data.data.user.isOnboardingComplete,
      );
      setUserOnboardingStep(2); // verify mail OTP
    },
    onError: (error) => {
      const message = erpCommunication(error, 'en-IN');
      toast.error(message.errorMessage || 'Oops, Something went wrong!');
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
    // dateOfBirth validation
    if (userData.dateOfBirth === '') {
      error.dateOfBirth = '*Required Date of Birth';
    }
    // email validation
    if (userDataItem.email === '') {
      error.email = '*Required Email';
    } else if (!emailPattern.test(userData.email)) {
      error.email = '*Please provide valid email';
    }

    // terms and conditioned applied validation
    if (userDataItem.isTermsAndConditionApplied === false) {
      error.isTermsAndConditionApplied = '*Please select the t&c box';
    }

    return error;
  };

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
            </div>
            {errorMsg?.name && <ErrorBox msg={errorMsg?.name} />}
          </div>

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
                className="focus:font-bold"
                type="text"
                placeholder="FGHJ1456T"
                name="panNumber"
                value={userData.panNumber}
                onChange={handleChange}
              />
            </div>
            {errorMsg?.panNumber && <ErrorBox msg={errorMsg?.panNumber} />}
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
            {errorMsg?.dateOfBirth && <ErrorBox msg={errorMsg?.dateOfBirth} />}
          </div>

          <div className="grid w-full items-center gap-1.5">
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
                className="focus:font-bold"
                type="text"
                placeholder="patrick@gmail.com*"
                name="email"
                value={userData.email}
                onChange={handleChange}
              />
            </div>
            {errorMsg?.email && <ErrorBox msg={errorMsg?.email} />}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={userData.isTermsAndConditionApplied}
                onCheckedChange={(checked) =>
                  setUserData((prev) => ({
                    ...prev,
                    isTermsAndConditionApplied: checked,
                  }))
                }
              />
              <div className="text-[#121212]">
                By selecting this box, I agree to all the{' '}
                <span className="text-[#288AF9]">terms & conditions</span>
              </div>
            </div>
            {errorMsg?.isTermsAndConditionApplied && (
              <ErrorBox msg={errorMsg?.isTermsAndConditionApplied} />
            )}
          </div>
          <Button type="submit" className="w-full bg-[#288AF9]" size="sm">
            {mutation.isPending ? <Loading /> : 'Proceed'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full p-2"
            onClick={() => router.push('/login')}
          >
            <ArrowLeft size={14} />
            Back
          </Button>

          <Link
            href="/"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            Skip for Now
          </Link>
        </div>
      </form>
    </>
  );
};

export default UserOnboardingDetails;
