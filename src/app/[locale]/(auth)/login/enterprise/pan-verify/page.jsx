'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import {
  getEnterpriseDetailsForPanVerify,
  getUserById,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

const EnterprisePANVerifyPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enterpriseType = searchParams.get('type');
  const userId = LocalStorageService.get('user_profile');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [enterpriseOnboardData, setEnterpriseOnboardData] = useState({
    panNumber: '',
    type: enterpriseType,
    enterpriseId,
  });
  const [errorMsg, setErrorMsg] = useState({});

  const { data: userData, isSuccess } = useQuery({
    queryKey: [userAuth.getUserById.endpointKey, userId],
    queryFn: () => getUserById(userId),
    select: (data) => data.data.data,
    enabled:
      enterpriseType === 'proprietorship' || enterpriseType === 'individual',
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    setEnterpriseOnboardData((prev) => ({
      ...prev,
      panNumber:
        enterpriseType === 'proprietorship' || enterpriseType === 'individual'
          ? userData?.panNumber
          : '', // Clears panNumber if enterpriseType is changed
    }));
  }, [isSuccess, enterpriseType, userData]);

  // PAN validation function
  const validatePanNumber = (panNumber) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    const errors = {};

    if (!panNumber.trim()) {
      errors.panNumber = '* Required PAN Number';
    } else if (!panPattern.test(panNumber)) {
      errors.panNumber = '* Please provide a valid PAN Number';
    }

    return errors;
  };

  // Handle input change
  const handleChangePan = useCallback((e) => {
    const panValue = e.target.value.toUpperCase();
    setEnterpriseOnboardData((prev) => ({ ...prev, panNumber: panValue }));

    const errors = validatePanNumber(panValue);
    setErrorMsg(errors);
  }, []);

  const getDetailsByPanVerifiedMutation = useMutation({
    mutationKey: [userAuth.getEnterpriseDetailsForPanVerify.endpointKey],
    mutationFn: getEnterpriseDetailsForPanVerify,
    onSuccess: (data) => {
      toast.success('Pan Verified Successfully');
      LocalStorageService.set('enterprise_Id', data?.data?.data?.enterpriseId);
      LocalStorageService.set('gst', data?.data?.data?.gstData?.gstinResList);

      if (
        enterpriseType === 'proprietorship' ||
        enterpriseType === 'individual'
      ) {
        router.push('/login/enterprise/gst-verify');
      } else {
        LocalStorageService.set(
          'companyData',
          data?.data?.data?.companyDetails,
        );
        router.push('/login/enterprise/cin-verify');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  // Handle form submission
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const errors = validatePanNumber(enterpriseOnboardData.panNumber);

      if (Object.keys(errors).length > 0) {
        setErrorMsg(errors);
        return;
      }

      setErrorMsg({});
      getDetailsByPanVerifiedMutation.mutate(enterpriseOnboardData);
    },
    [enterpriseOnboardData.panNumber],
  );

  // Navigate back
  const handleBack = useCallback(() => {
    router.push('/login/enterprise/select_enterprise_type');
  }, [router]);

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-2xl font-bold text-[#121212]">
              Onboard your Enterprise
            </h1>
            <p className="text-center text-sm font-semibold text-[#A5ABBD]">
              Enter all the details to unlock Hues completely
            </p>
          </div>

          {/* Form */}
          <form
            className="grid w-full items-center gap-5"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="pan-number"
                className="font-medium text-[#121212]"
              >
                Enterprise PAN <span className="text-red-600">*</span>
              </Label>
              <div className="flex items-center hover:border-gray-600">
                <Input
                  id="pan-number"
                  type="text"
                  name="pan"
                  placeholder="ABCDE1234F"
                  className="uppercase focus:font-bold"
                  onChange={handleChangePan}
                  value={enterpriseOnboardData.panNumber}
                  disabled={
                    enterpriseType === 'proprietorship' ||
                    enterpriseType === 'individual'
                  }
                />
              </div>
              {errorMsg.panNumber && (
                <span className="px-1 text-sm font-semibold text-red-600">
                  {errorMsg.panNumber}
                </span>
              )}
            </div>

            <Button
              size="sm"
              type="submit"
              disabled={getDetailsByPanVerifiedMutation?.isPending}
            >
              {getDetailsByPanVerifiedMutation?.isPending ? (
                <Loading />
              ) : (
                'Proceed'
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft size={14} />
              Back
            </Button>
          </form>
        </div>
      </div>
    </UserProvider>
  );
};

export default EnterprisePANVerifyPage;
