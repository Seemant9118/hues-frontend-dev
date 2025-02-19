'use client';

import { Button } from '@/components/ui/button';
import ErrorBox from '@/components/ui/ErrorBox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const GstVerificationPage = () => {
  const router = useRouter();
  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    gst: '',
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const isAnyErrorMsg = validateGstNumber(enterpriseOnboardData.gst);
    if (Object.keys(isAnyErrorMsg).length > 0) {
      setErrorMsg(isAnyErrorMsg);
    } else {
      // API call
      // console.log('Submitting:', enterpriseOnboardData);
    }
  };

  const handleBack = () => {
    router.push('/login/enterprise/select_enterprise_type');
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            We found some GST Numbers against this PAN
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
              value={isManualEntry ? '' : enterpriseOnboardData.gst} // Clear dropdown if manually entered
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your preferred GST number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="27ABCDE1234F1Z5">27ABCDE1234F1Z5</SelectItem>
                <SelectItem value="09FGHIJ5678K2Z3">09FGHIJ5678K2Z3</SelectItem>
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
                value={isManualEntry ? enterpriseOnboardData.gst : ''} // Clear input if selected from dropdown
              />
            </div>
            {errorMsg.gstNumber && <ErrorBox msg={errorMsg.gstNumber} />}
          </div>

          <Button size="sm" type="submit">
            Proceed
          </Button>
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft size={14} />
            Back
          </Button>
        </form>

        <div className="flex w-full flex-col gap-20">
          <Link
            href="/"
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
