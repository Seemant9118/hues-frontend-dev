import Tooltips from '@/components/auth/Tooltips';
import ErrorBox from '@/components/ui/ErrorBox';
import Loading from '@/components/ui/Loading';
import RadioSelect from '@/components/ui/RadioSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import { updateEnterpriseOnboarding } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import {
  AtSign,
  Building,
  CreditCard,
  Hash,
  Info,
  MapPinned,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

const EnterpriseOnboarding = () => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    name: '',
    type: '',
    address: '',
    email: '',
    gstNumber: '',
    panNumber: '',
  });
  const [errorMsg, setErrorMsg] = useState({});

  const enterpriseTypes = [
    'Properitership',
    'Partnership',
    'LLP',
    'Pvt. Ltd. Company',
    'NGO',
  ];

  // useEffect(() => {
  //   setEnterpriseOnboardData((prevUserData) => ({
  //     ...prevUserData,
  //     date_of_incorporation: selectedDate
  //       ? moment(selectedDate).format("DD/MM/YYYY")
  //       : "", // Update dynamically
  //   }));
  // }, [selectedDate]);

  // mutation
  const enterpriseOnboardMutation = useMutation({
    mutationFn: (data) => updateEnterpriseOnboarding(enterpriseId, data),
    onSuccess: (data) => {
      LocalStorageService.set(
        'isEnterpriseOnboardingComplete',
        data.data.data.isEnterpriseOnboardingComplete,
      );
      toast.success(data.data.message);
      router.push('/');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Oops, Something went wrong!');
    },
  });

  // validation
  const validation = (enterpriseOnboardD) => {
    const error = {};
    // const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    // const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (enterpriseOnboardD.name === '') {
      error.enterpriseName = '*Required Enterprise Name';
    }
    if (enterpriseOnboardD.type === '') {
      error.enterpriseType = '*Please select your enterprise type';
    }
    // if (!email_pattern.test(enterpriseOnboardData.email)) {
    //   error.email = "*Please provide valid email";
    // }
    // if (enterpriseOnboardData.address === "") {
    //   error.address = "*Required Address";
    // }
    // if (enterpriseOnboardData.gst_number === "") {
    //   error.gst_number = "*Required GST IN";
    // }
    // if (enterpriseOnboardData.date_of_incorporation === "") {
    //   error.date_of_incorporation = "*Required Date of Incorporation";
    // }
    // if (!pan_pattern.test(enterpriseOnboardData.pan_number)) {
    //   error.pan_number = "* Please provide valid PAN Number";
    // }
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
      setEnterpriseOnboardData((values) => ({
        ...values,
        [name]: value.toUpperCase(),
      }));
      return;
    }

    setEnterpriseOnboardData((values) => ({ ...values, [name]: value }));
  };

  const handleEnterpriseType = (enterpriseType) => {
    setEnterpriseOnboardData((values) => ({
      ...values,
      type: enterpriseType,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData);

    if (Object.keys(isError).length === 0) {
      setErrorMsg({});
      enterpriseOnboardMutation.mutate(enterpriseOnboardData);
    } else {
      setErrorMsg(isError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-4 rounded-md border border-[#E1E4ED] bg-white px-5 py-2"
    >
      <h1 className="w-full text-center text-2xl font-bold text-[#414656]">
        Enterprise Onboarding
      </h1>

      <div className="grid w-full max-w-sm items-center gap-1">
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
            required
            className="focus:font-bold"
            type="text"
            placeholder="Enterprise Name"
            name="name"
            value={enterpriseOnboardData.name}
            onChange={handleChange}
          />
          <Building className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
        </div>
        {errorMsg.enterpriseName && <ErrorBox msg={errorMsg.enterpriseName} />}
      </div>

      <div className="grid w-full max-w-sm items-center gap-5">
        <Label
          htmlFor="enterpriseType"
          className="flex items-center gap-1 font-medium text-[#414656]"
        >
          Select the option that best describes your enterprise{' '}
          <span className="text-red-600">*</span>{' '}
        </Label>
        <div className="flex flex-wrap gap-5">
          {enterpriseTypes.map((type) => (
            <RadioSelect
              key={type}
              option={type}
              value={type.toLowerCase()}
              handleChange={handleEnterpriseType}
            />
          ))}
        </div>
        {errorMsg.enterpriseType && <ErrorBox msg={errorMsg.enterpriseType} />}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1">
        <Label
          htmlFor="address"
          className="flex items-center gap-1 font-medium text-[#414656]"
        >
          Address
          <Tooltips
            trigger={<Info size={12} />}
            content="Your Enterprise Address"
          />
        </Label>

        <div className="relative">
          <Input
            className="focus:font-bold"
            type="text"
            placeholder="Address"
            name="address"
            value={enterpriseOnboardData.address}
            onChange={handleChange}
          />
          <MapPinned className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
        </div>
        {/* {errorMsg.address && <ErrorBox msg={errorMsg.address} />} */}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1">
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
          <AtSign className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
        </div>
        {errorMsg.email && <ErrorBox msg={errorMsg.email} />}
      </div>

      <div className="grid w-full max-w-sm items-center gap-1">
        <Label
          htmlFor="gst"
          className="flex items-center gap-1 font-medium text-[#414656]"
        >
          GST IN
          <Tooltips trigger={<Info size={12} />} content="GST IN" />
        </Label>

        <div className="relative">
          <Input
            className="focus:font-bold"
            type="text"
            placeholder="GST IN"
            name="gstNumber"
            value={enterpriseOnboardData.gstNumber}
            onChange={handleChange}
          />
          <Hash className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
        </div>
      </div>

      {/* <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label
          htmlFor="dob"
          className="text-[#414656] font-medium flex items-center gap-1"
        >
          Date of Incorporation <span className="text-red-600">*</span>{" "}
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
          <CalendarDays className=" text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2 z-0" />
        </div>
        {errorMsg.date_of_incorporation && (
          <ErrorBox msg={errorMsg.date_of_incorporation} />
        )}
      </div> */}

      <div className="grid w-full max-w-sm items-center gap-1">
        <Label
          htmlFor="panNumber"
          className="flex items-center gap-1 font-medium text-[#414656]"
        >
          Permanent Account Number
          <Tooltips
            trigger={<Info size={12} />}
            content="PAN: Your universal legal identifier for all government and financial interactions on Hues."
          />
        </Label>
        <div className="relative">
          <Input
            className="focus:font-bold"
            type="text"
            placeholder="FGHJ1456T"
            name="panNumber"
            value={enterpriseOnboardData.panNumber}
            onChange={handleChange}
          />
          <CreditCard className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
        </div>
        {errorMsg.panNumber && <ErrorBox msg={errorMsg.panNumber} />}
      </div>

      <Button type="submit" className="w-full">
        {enterpriseOnboardMutation.isPending ? <Loading /> : 'Submit'}
      </Button>

      <Link
        href="/"
        className="flex w-full items-center justify-center text-sm text-slate-700 underline"
      >
        Skip for Now
      </Link>
    </form>
  );
};

export default EnterpriseOnboarding;
