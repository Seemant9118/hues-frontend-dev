import Tooltips from '@/components/auth/Tooltips';
import ErrorBox from '@/components/ui/ErrorBox';
import RadioSelect from '@/components/ui/RadioSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocalStorageService } from '@/lib/utils';
import { updateEnterpriseOnboarding } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { AtSign, Building, Info, MapPinned } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const EnterpriseSecond = ({
  setEnterpriseCurrStep,
  enterpriseOnboardData,
  setEnterpriseOnboardData,
}) => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const [errorMsg, setErrorMsg] = useState({});

  // mutationFn
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEnterpriseOnboardData((values) => ({ ...values, [name]: value }));
  };

  const validation = (enterpriseOnboardD) => {
    const error = {};
    if (enterpriseOnboardD.name === '') {
      error.enterpriseName = '*Required Enterprise Name';
    }
    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isError = validation(enterpriseOnboardData);

    if (enterpriseOnboardData.type !== 'individual') {
      if (Object.keys(isError).length === 0) {
        setErrorMsg({});
        // console.log('others:', enterpriseOnboardData);
        setEnterpriseCurrStep(3);
      } else {
        setErrorMsg(isError);
      }
    } else {
      // mutation call for just individual
      enterpriseOnboardMutation.mutate(enterpriseOnboardData);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="z-20 flex min-h-[400px] w-[450px] flex-col items-center justify-between gap-4 rounded-md border border-[#E1E4ED] bg-white p-5"
    >
      <h1 className="w-full text-center text-2xl font-bold text-[#414656]">
        Enterprise Onboarding
      </h1>

      {/* show selected radio */}
      <div className="grid w-full max-w-md items-center gap-5">
        <Label
          htmlFor="enterpriseType"
          className="flex items-center font-medium text-[#414656]"
        >
          Select the option that best describes your enterprise{' '}
          <span className="text-red-600">*</span>{' '}
        </Label>
        <div className="flex flex-wrap gap-5">
          <RadioSelect
            name="enterpriseType"
            option={'Individual'}
            value="individual"
            checked={enterpriseOnboardData.type === 'individual'}
            disabled={true}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Properitership'}
            value="properitership"
            checked={enterpriseOnboardData.type === 'properitership'}
            disabled={true}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Partnership'}
            value="partnership"
            checked={enterpriseOnboardData.type === 'partnership'}
            disabled={true}
          />
          <RadioSelect
            name="enterpriseType"
            option={'LLP'}
            value="llp"
            checked={enterpriseOnboardData.type === 'llp'}
            disabled={true}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Private Limited Company'}
            value="privateLimited"
            checked={enterpriseOnboardData.type === 'privateLimited'}
            disabled={true}
          />
          <RadioSelect
            name="enterpriseType"
            option={'Public Limited Company'}
            value="publicLimited"
            checked={enterpriseOnboardData.type === 'publicLimited'}
            disabled={true}
          />
        </div>
        {/* {errorMsg.enterpriseType && <ErrorBox msg={errorMsg.enterpriseType} />} */}
      </div>

      {/* for Individuals */}
      {enterpriseOnboardData.type === 'individual' && (
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
      )}

      {/* for others - properitership/Partnership/LLP/Pvt. Ltd. Company/Public Ltd. Company */}
      {enterpriseOnboardData.type !== 'individual' && (
        <>
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
                className="focus:font-bold"
                type="text"
                placeholder="Enterprise Name"
                name="name"
                value={enterpriseOnboardData.name}
                onChange={handleChange}
              />
              <Building className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F5575]" />
            </div>
            {errorMsg.enterpriseName && (
              <ErrorBox msg={errorMsg.enterpriseName} />
            )}
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
            {/* {errorMsg.email && <ErrorBox msg={errorMsg.email} />} */}
          </div>
        </>
      )}

      <div className="flex w-full flex-col gap-4">
        <Button type="submit" className="w-full">
          {enterpriseOnboardData.type === 'individual' ? 'Submit' : 'Continue'}
        </Button>

        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm text-slate-700 underline"
        >
          Skip for Now
        </Link>
      </div>
    </form>
  );
};

export default EnterpriseSecond;
