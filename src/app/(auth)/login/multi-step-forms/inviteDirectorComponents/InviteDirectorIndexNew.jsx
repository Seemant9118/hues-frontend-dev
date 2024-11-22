import { invitation } from '@/api/invitation/Invitation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { sendDirectorInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { Label } from '@radix-ui/react-label';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const InviteDirectorIndexNew = ({
  setDirectorInviteStep,
  setInvitationUrl,
}) => {
  const router = useRouter();
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [errorMsg, setErrorMsg] = useState({});
  const [inviteeData, setInviteeData] = useState({
    fromEnterpriseId: enterpriseId,
    toEnterpriseId: enterpriseId,
    email: '',
    mobileNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInviteeData({ ...inviteeData, [name]: value });
  };

  const sendInvitationMutation = useMutation({
    mutationKey: [invitation.sendDirectorInvitation.endpointKey],
    mutationFn: sendDirectorInvitation,
    onSuccess: (data) => {
      toast.success('Invite sent Successfully');
      setInvitationUrl(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      ); // set response url
      setDirectorInviteStep(2); //  share link copy
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const validation = (inviteeData) => {
    const error = {};
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // email validation
    if (inviteeData.email === '') {
      error.email = '*Required Email';
    } else if (!emailPattern.test(inviteeData.email)) {
      error.email = '*Please provide valid email';
    }

    if (inviteeData.mobileNumber === '') {
      error.mobileNumber = '*Required Phone Number';
    } else if (inviteeData?.mobileNumber?.length !== 10) {
      error.mobileNumber = '*Please provide valid Phone Number';
    }

    return error;
  };

  const handleSendInviteToDirector = () => {
    const isAnyError = validation(inviteeData);

    if (Object.keys(isAnyError).length === 0) {
      setErrorMsg({});
      sendInvitationMutation.mutate(inviteeData);
    }
    setErrorMsg(isAnyError);
  };

  return (
    <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          Invite Director
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          We need the director’s approval to onboard the enterprise
        </p>
      </div>

      <form className="grid w-full items-center gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="mobile-number" className="font-medium text-[#121212]">
            Email <span className="text-red-600">*</span>
          </Label>
          <div className="flex items-center hover:border-gray-600">
            <Input
              type="text"
              name="email"
              placeholder="patrick@gmail.com"
              className="focus:font-bold"
              value={inviteeData.email}
              onChange={handleChange}
            />
          </div>
          {errorMsg.email && (
            <span className="w-full px-1 text-sm font-semibold text-red-600">
              {errorMsg.email}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mobile-number" className="font-medium text-[#121212]">
            Phone Number <span className="text-red-600">*</span>
          </Label>
          <div className="flex items-center hover:border-gray-600">
            <Input
              type="text"
              name="mobileNumber"
              placeholder="1234567890"
              className="focus:font-bold"
              value={inviteeData.mobileNumber}
              onChange={handleChange}
            />
          </div>
          {errorMsg.mobileNumber && (
            <span className="w-full px-1 text-sm font-semibold text-red-600">
              {errorMsg.mobileNumber}
            </span>
          )}
        </div>
      </form>

      <div className="flex w-full flex-col gap-5">
        <Button
          size="sm"
          onClick={handleSendInviteToDirector}
          disabled={sendInvitationMutation.isPending}
          className="bg-[#288AF9]"
        >
          {sendInvitationMutation.isPending ? <Loading /> : 'Send Invite'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full p-2"
          onClick={() => router.push('/login/isDirector')} // director consent
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
  );
};

export default InviteDirectorIndexNew;
