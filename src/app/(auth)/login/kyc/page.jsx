'use client';

import { userAuth } from '@/api/user_auth/Users';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import '@/services/Digio';
import {
  createKYCRequest,
  getUserById,
} from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const CompleteKycPage = () => {
  // user_id get from localStorage
  const userId = LocalStorageService.get('user_profile');
  const router = useRouter();
  // eslint-disable-next-line no-unused-vars
  const [digio, setDigio] = useState(null);

  const { refetch: refetchKycStatus } = useQuery({
    queryKey: [userAuth.getUserById.endpointKey, userId],
    queryFn: () => getUserById(userId),
    enabled: false, // Disable auto-fetching; we will manually trigger it
    select: (data) => data.data.data,
  });

  function handleKycStatus() {
    refetchKycStatus()
      .then(({ data }) => {
        if (data.isKycVerified) {
          toast.success('KYC completed successfully!');
          router.push('/'); //  redirect to home page after success
        } else {
          // Polling till isKycVerified
          setTimeout(handleKycStatus, 5000); // Poll every 5 seconds
        }
      })
      .catch(() => {
        toast.error('KYC failed. Please try again after some time');
      });
  }

  // digio instantiations
  const options = {
    // Is_redirection_approach: true,
    // redirect_url: "http:localhost:3000",
    environment: 'sandbox',
    callback(response) {
      if (Object.prototype.hasOwnProperty.call(response, 'error_code')) {
        return toast.error(response.message);
      }
      // Trigger KYC status check
      handleKycStatus();
      return null;
    },
    event_listener: () => {
      // console.log(data, "event_l");
    },
    logo: 'https://hues-frontend.vercel.app/_next/image?url=%2Fhues_logo.png&w=128&q=75',
    theme: {
      primaryColor: '#288AF9',
      secondaryColor: '#ffffff',
    },
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://ext-gateway.digio.in/sdk/v11/digio.js';
    // script.src = "https://app.digio.in/sdk/v11/digio.js";
    script.async = true;
    script.onload = async () => {
      const digioInstance = new window.Digio(options);
      setDigio(digioInstance);
    };
    document.body.appendChild(script);
  }, []);

  const loadScript = async (data) => {
    const digioInstance = new window.Digio(options);
    digioInstance.init();
    digioInstance.submit(
      data.request_id,
      data.user_identifier,
      data.access_token.id,
    );
  };

  // api call of create kyc req
  const digioMutation = useMutation({
    mutationKey: [userAuth.createKYC.endpointKey],
    mutationFn: createKYCRequest,
    onSuccess: (data) => {
      loadScript(data.data.data);
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
            Please Complete Your KYC
          </h1>

          <Button
            onClick={() => digioMutation.mutate(userId)}
            size="sm"
            type="submit"
            className="w-full bg-[#288AF9]"
            disabled={digioMutation.isPending}
          >
            {digioMutation.isPending ? <Loading /> : 'Start KYC'}
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
