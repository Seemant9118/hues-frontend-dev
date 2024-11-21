'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import '@/services/Digio';
import {
  createKYCRequest,
  getUserById,
  verifyKYCstatusandUpdate,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const CompleteKycPage = () => {
  const userId = LocalStorageService.get('user_profile');
  const router = useRouter();
  const apiCallCountRef = useRef(0); // Ref to track API call count
  const [isKycProcessStarted, setIsKycProcessStarted] = useState(false);

  // Query to verify KYC status and update
  const {
    data: verifyKycData,
    refetch: refetchVerifyKYCstatusAndUpdate,
    isSuccess: isrefetchVerifyKYCstatusAndUpdateSuccess,
  } = useQuery({
    queryKey: [userAuth.verifykycstatusandupdate.endpointKey],
    queryFn: verifyKYCstatusandUpdate,
    enabled: false, // Disabled auto-fetching, manually triggered
    onError: () => {
      toast.error('KYC failed, Please try again later');
    },
  });
  if (isrefetchVerifyKYCstatusAndUpdateSuccess) {
    if (verifyKycData?.data?.data?.isKycVerified) {
      toast.success('KYC Verified successfully!');
      router.push('/');
    } else {
      toast.error(
        verifyKycData?.data?.data?.errors || 'KYC verification failed.',
      );
    }
  }

  // Query to check KYC status
  const { refetch: refetchKycStatus, isFetching: iskycStatusFetching } =
    useQuery({
      queryKey: [userAuth.getUserById.endpointKey, userId],
      queryFn: () => getUserById(userId),
      enabled: false, // Disabled auto-fetching, manually triggered
      select: (data) => data.data.data,
      onError: () => {
        toast.error('Failed to fetch KYC status.');
      },
    });
  if (iskycStatusFetching) {
    apiCallCountRef.current += 1; // Increment API call count
    // Check if 5 unsuccessful attempts have been made, trigger verification update
    if (apiCallCountRef.current === 5) {
      refetchVerifyKYCstatusAndUpdate();
    }
  }

  // Function to handle KYC status polling
  const handleKycStatus = () => {
    refetchKycStatus()
      .then(({ data }) => {
        if (data.isKycVerified) {
          LocalStorageService.set('isKycVerified', data.isKycVerified);
          toast.success('KYC completed successfully!');
          router.push('/'); // Redirect to home page on success
        } else {
          // Poll every 5 seconds if KYC is not verified
          setTimeout(handleKycStatus, 5000);
        }
      })
      .catch(() => {
        toast.error('KYC failed. Please try again later.');
      });
  };

  // Digio initialization options
  const options = {
    environment: 'sandbox',
    callback(response) {
      if (Object.prototype.hasOwnProperty.call(response, 'error_code')) {
        setIsKycProcessStarted(false);
        return toast.error(response.message);
      }
      // Trigger KYC status check after successful KYC initiation
      handleKycStatus();
      return null;
    },
    event_listener: () => {},
    logo: process.env.NEXT_PUBLIC_DIGIO_LOGO,
    theme: {
      primaryColor: '#288AF9',
      secondaryColor: '#ffffff',
    },
  };

  // Load Digio script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = process.env.NEXT_PUBLIC_DIGIO_SCRIPT_URL;
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Function to load Digio and initiate the KYC process
  const loadScript = async (data) => {
    const digioInstance = new window.Digio(options);
    digioInstance.init();
    digioInstance.submit(
      data.request_id,
      data.user_identifier,
      data.access_token.id,
    );
  };

  // API call to create KYC request
  const digioMutation = useMutation({
    mutationKey: [userAuth.createKYC.endpointKey],
    mutationFn: createKYCRequest,
    onSuccess: (data) => {
      loadScript(data.data.data);
      setIsKycProcessStarted(true);
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[500px] w-[450px] flex-col items-center justify-center gap-16">
        <div className="flex w-full flex-col gap-5">
          <h1 className="w-full text-center text-xl font-bold text-[#121212]">
            {isKycProcessStarted
              ? 'KYC Process started...'
              : 'Please Complete Your KYC'}
          </h1>

          <Button
            onClick={() => digioMutation.mutate(userId)}
            size="sm"
            type="submit"
            className="w-full bg-[#288AF9]"
            disabled={digioMutation.isPending || iskycStatusFetching}
          >
            {digioMutation.isPending || iskycStatusFetching ? (
              <Loading />
            ) : (
              'Start KYC'
            )}
          </Button>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
        >
          Later
        </Link>
      </div>
    </div>
  );
};

export default CompleteKycPage;
