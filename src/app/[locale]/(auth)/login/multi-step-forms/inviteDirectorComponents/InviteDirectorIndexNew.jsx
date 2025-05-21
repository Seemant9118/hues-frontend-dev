import { invitation } from '@/api/invitation/Invitation';
import { validateEmail, validatePhoneNumber } from '@/appUtils/ValidationUtils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loading from '@/components/ui/Loading';
import { LocalStorageService } from '@/lib/utils';
import { sendDirectorInvitation } from '@/services/Invitation_Service/Invitation_Service';
import { Label } from '@radix-ui/react-label';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

const InviteDirectorIndexNew = ({
  setDirectorInviteStep,
  setInvitationUrl,
}) => {
  const translations = useTranslations('auth.enterprise.inviteDirector');
  const translationForError = useTranslations();
  const router = useRouter();
  const tempEnterpriseId = LocalStorageService.get('tempEnterpriseId');
  const enterpriseId = LocalStorageService.get('enterprise_Id');

  const [errorMsg, setErrorMsg] = useState({});
  const [inviteeData, setInviteeData] = useState({
    fromEnterpriseId: tempEnterpriseId ?? enterpriseId,
    toEnterpriseId: tempEnterpriseId ?? enterpriseId,
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
      toast.success(translations('toast.success'));
      setInvitationUrl(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      ); // set response url
      setDirectorInviteStep(2); //  share link copy
    },
    onError: (error) => {
      toast.error(error.response.data.message || translations('toast.error'));
    },
  });

  const validation = (inviteeData) => {
    const errors = {};

    errors.email = validateEmail(inviteeData.email);
    errors.mobileNumber = validatePhoneNumber(inviteeData.mobileNumber);

    // Remove empty error messages
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    return errors;
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
          {translations('heading')}
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          {translations('description')}
        </p>
      </div>

      <form className="grid w-full items-center gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="mobile-number" className="font-medium text-[#121212]">
            {translations('emailLabel')} <span className="text-red-600">*</span>
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
              {translationForError(errorMsg.email)}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="mobile-number" className="font-medium text-[#121212]">
            {translations('phoneLabel')} <span className="text-red-600">*</span>
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
              {translationForError(errorMsg.mobileNumber)}
            </span>
          )}
        </div>
      </form>

      <div className="flex w-full flex-col gap-2">
        <Button
          size="sm"
          onClick={handleSendInviteToDirector}
          disabled={sendInvitationMutation.isPending}
          className="bg-[#288AF9]"
        >
          {sendInvitationMutation.isPending ? (
            <Loading />
          ) : (
            translations('sendInvite')
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full p-2"
          onClick={() => router.back()} // director consent
        >
          <ArrowLeft size={14} />
          {translations('back')}
        </Button>
      </div>
    </div>
  );
};

export default InviteDirectorIndexNew;
