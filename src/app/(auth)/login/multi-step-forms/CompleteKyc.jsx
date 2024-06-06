'use client';

import { userAuth } from '@/api/user_auth/Users';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { LocalStorageService } from '@/lib/utils';
import '@/services/Digio';
import { createKYCRequest } from '@/services/User_Auth_Service/UserAuthServices';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

const CompleteKyc = () => {
  const router = useRouter();
  // const [digio, setDigio] = useState(null);

  const options = {
    // Is_redirection_approach: true,
    // redirect_url: "http:localhost:3000",
    environment: 'sandbox',
    callback(response) {
      console.log(response);
      if (response.hasOwnProperty('error_code')) {
        return console.log('error occurred in process');
      }
      // check status api call
      console.log('Signing;completed;successfully:');
      router.push('/');
    },
    event_listener: (data) => {
      // console.log(data, "event_l");
    },
    // logo: "https://www.mylogourl.com/image.jpeg",
    theme: {
      primaryColor: '#2563EB',
      secondaryColor: '#ffffff',
    },
  };

  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "https://ext-gateway.digio.in/sdk/v11/digio.js";
  //   // script.src = "https://app.digio.in/sdk/v11/digio.js";
  //   script.async = true;
  //   script.onload = async () => {
  //     const digioInstance = new window.Digio(options);
  //     setDigio(digioInstance);
  //   };
  //   document.body.appendChild(script);
  // }, []);

  const loadScript = async (data) => {
    const digioInstance = new window.Digio(options);
    console.log(data);
    digioInstance.init();
    digioInstance.submit(
      data.request_id,
      data.user_identifier,
      data.access_token.id,
    );
  };

  const { mutate, isPending } = useMutation({
    mutationKey: [userAuth.createKYC.endpointKey],
    mutationFn: () => {
      const userId = LocalStorageService.get('user_profile');
      return createKYCRequest(userId);
    },
    onSuccess: (data) => {
      console.log(data.data.data);
      loadScript(data.data.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutate();
      }}
      className="z-20 flex h-[500px] w-[450px] flex-col items-center justify-center gap-3 rounded-md border border-[#E1E4ED] bg-white px-5 py-10"
    >
      <h1 className="w-full text-center text-2xl font-bold text-[#414656]">
        Please Complete Your KYC
      </h1>

      <Button type="submit" className="w-full">
        {isPending ? <Loading /> : <>Start KYC</>}
      </Button>
    </form>
  );
};

export default CompleteKyc;
