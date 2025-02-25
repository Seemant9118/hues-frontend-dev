'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LocalStorageService } from '@/lib/utils';
import { gstVerify } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const GstVerificationPage = () => {
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const gstDatas = LocalStorageService.get('gst');

  const router = useRouter();
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    gstNumber: '',
    enterpriseId,
  });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  const validateGstNumber = (gstNumber) => {
    const gstPattern =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    const error = {};

    if (!gstNumber) {
      error.gstNumber = '*Required GST Number';
    } else if (!gstPattern.test(gstNumber)) {
      error.gstNumber = '* Please provide a valid GST Number';
    }

    return error;
  };

  const handleChangeGst = (e) => {
    const gstValue = e.target.value.toUpperCase(); // Ensure uppercase
    setEnterpriseOnboardData({ gst: gstValue });
    setIsManualEntry(true); // Mark as manual entry

    // Run validation
    const isAnyErrorMsg = validateGstNumber(gstValue);
    setErrorMsg(isAnyErrorMsg);
  };

  const handleSelectGst = (value) => {
    setEnterpriseOnboardData({ gst: value });
    setIsManualEntry(false); // Mark as dropdown selection
    setErrorMsg({}); // Clear any validation errors
  };

  const gstVerifyMutation = useMutation({
    mutationKey: [userAuth.gstVerify.endpointKey],
    mutationFn: gstVerify,
    onSuccess: (data) => {
      toast.success('GST Verified Successfully');

      LocalStorageService.set(
        'enterprise_Id',
        data?.data?.data?.user?.enterpriseId,
      );

      router.push('/login/enterprise/udyam-veriy');
    },
    onError: (error) => {
      toast.error(error.data.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isAnyErrorMsg = validateGstNumber(enterpriseOnboardData.gst);
    if (Object.keys(isAnyErrorMsg).length > 0) {
      setErrorMsg(isAnyErrorMsg);
    } else {
      // API call
      gstVerifyMutation.mutate(enterpriseOnboardData);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            {gstDatas?.length === 0 || gstDatas === null
              ? 'No GST Number found against this PAN'
              : 'We found some GST Numbers against this PAN'}
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            Choose your principle place of business from the list below or add
            one
          </p>
        </div>

        <form
          className="grid w-full items-center gap-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="gst-number" className="font-medium text-[#121212]">
              Fetched GST numbers
            </Label>
            <Select
              onValueChange={handleSelectGst}
              value={isManualEntry ? '' : enterpriseOnboardData.gstNumber} // Clear dropdown if manually entered
            >
              <SelectTrigger
                disabled={gstDatas?.length === 0 || gstDatas === null}
              >
                <SelectValue placeholder="Choose your preferred GST number" />
              </SelectTrigger>
              <SelectContent>
                {gstDatas?.map((gst) => (
                  <SelectItem key={gst} value={gst.gstin}>
                    {gst.gstin}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex w-full items-center justify-center p-2 text-sm font-semibold text-[#A5ABBD]">
            --- OR ---
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="gst-number" className="font-medium text-[#121212]">
              Enter your GST number
            </Label>
            <div className="flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="gst"
                placeholder="Enter your GST number"
                className="uppercase focus:font-bold"
                onChange={handleChangeGst}
                value={isManualEntry ? enterpriseOnboardData.gstNumber : ''} // Clear input if selected from dropdown
              />
            </div>
            {errorMsg.gstNumber && <ErrorBox msg={errorMsg.gstNumber} />}
          </div>

          <Button
            size="sm"
            type="submit"
            disabled={gstVerifyMutation.isPending}
          >
            {gstVerifyMutation.isPending ? <Loading /> : 'Proceed'}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            Back
          </Button>
        </form>

        <div className="flex w-full flex-col gap-20">
          <Link
            href="/login/enterprise/udyam-verify"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            Skip for Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GstVerificationPage;
