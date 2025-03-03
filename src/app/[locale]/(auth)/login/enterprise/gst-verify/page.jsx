'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
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
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

const GstVerificationPage = () => {
  const type = LocalStorageService.get('type');
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const router = useRouter();

  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    gstNumber: '',
    enterpriseId,
    type,
  });
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [gstData, setGstData] = useState(null);

  useEffect(() => {
    const storedGstData = LocalStorageService.get('gst');
    setGstData(storedGstData || []);

    if (storedGstData?.length === 1) {
      setEnterpriseOnboardData((prev) => ({
        ...prev,
        gstNumber: storedGstData[0].gstin,
      }));
      setIsManualEntry(false);
    }
  }, []);

  const handleChangeGst = (e) => {
    const gstValue = e.target.value.toUpperCase();
    setEnterpriseOnboardData((prev) => ({
      ...prev,
      gstNumber: gstValue,
    }));
    setIsManualEntry(true);
  };

  const handleSelectGst = (value) => {
    setEnterpriseOnboardData((prev) => ({
      ...prev,
      gstNumber: value,
    }));
    setIsManualEntry(false);
  };

  const gstVerifyMutation = useMutation({
    mutationKey: [userAuth.gstVerify.endpointKey],
    mutationFn: gstVerify,
    onSuccess: (data) => {
      toast.success('GST Verified Successfully');
      LocalStorageService.set('enterprise_Id', data?.data?.data?.enterpriseId);
      router.push('/login/enterprise/udyam-verify');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (enterpriseOnboardData.gstNumber === '') {
      return router.push('/login/enterprise/udyam-verify');
    } else {
      return gstVerifyMutation.mutate(enterpriseOnboardData);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (gstData === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
        <div className="flex flex-col gap-4">
          {gstData.length === 0 ? (
            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              No GST Number found against this PAN
            </h1>
          ) : (
            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              We found some GST Numbers against this PAN
            </h1>
          )}

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
              value={isManualEntry ? '' : enterpriseOnboardData.gstNumber}
            >
              <SelectTrigger disabled={gstData.length === 0}>
                <SelectValue placeholder="Choose your preferred GST number" />
              </SelectTrigger>
              <SelectContent>
                {gstData.map((gst) => (
                  <SelectItem key={gst.gstin} value={gst.gstin}>
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
                value={isManualEntry ? enterpriseOnboardData.gstNumber : ''}
              />
            </div>
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
      </div>
    </div>
  );
};

export default GstVerificationPage;
