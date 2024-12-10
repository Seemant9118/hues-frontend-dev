'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { UserProvider } from '@/context/UserContext';
import { LocalStorageService } from '@/lib/utils';
import { VerifyDIN } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const DINVerifyPage = () => {
  const router = useRouter();
  const isKycVerified = LocalStorageService.get('isKycVerified');

  const [dinNumber, setDinNumber] = useState({
    din: '',
  });

  const handleChange = (e) => {
    const { value } = e.target;

    setDinNumber({ ...dinNumber, din: value });
  };

  const verifyDINMutation = useMutation({
    mutationKey: [userAuth.verifyDIN.endpointKey],
    mutationFn: VerifyDIN,
    onSuccess: () => {
      toast.success('DIN number verified successfully');
      if (isKycVerified) {
        const redirectUrl = LocalStorageService.get('redirectUrl');
        LocalStorageService.remove('redirectUrl'); // Clear the redirect URL
        router.push(redirectUrl || '/');
      } else {
        router.push('/login/kyc');
      }
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  const handleProceedDIN = () => {
    verifyDINMutation.mutate(dinNumber);
  };

  return (
    <UserProvider>
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
          <div className="flex flex-col gap-4">
            <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
              Enter DIN number
            </h1>
            <p className="w-full text-center text-sm text-[#A5ABBD]">
              We need the DIN of the director to verify.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="din-number" className="font-medium text-[#121212]">
              DIN number <span className="text-red-600">*</span>
            </Label>
            <div className="relative flex items-center hover:border-gray-600">
              <Input
                type="text"
                name="dinNumber"
                placeholder="DIN number"
                className="focus:font-bold"
                onChange={handleChange}
                value={dinNumber.din}
              />
            </div>
          </div>

          <div className="flex w-full flex-col gap-14">
            <Button
              size="sm"
              className="w-full bg-[#288AF9] p-2"
              onClick={handleProceedDIN}
              disabled={verifyDINMutation.isPending}
            >
              {verifyDINMutation.isPending ? <Loading /> : 'Proceed'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full p-2"
              onClick={() => router.back()} // director consent
            >
              <ArrowLeft size={14} />
              Back
            </Button>
          </div>
          <Link
            href="/"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            Skip for Now
          </Link>
        </div>
      </div>
    </UserProvider>
  );
};

export default DINVerifyPage;
