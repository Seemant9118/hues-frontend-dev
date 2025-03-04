import { invitation } from '@/api/invitation/Invitation';
import { getInitialsNames, getRandomBgColor } from '@/appUtils/helperFunctions';
import {
  remindInvitation,
  resendInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { useMutation } from '@tanstack/react-query';
import { Dot } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const InvitationActionModal = ({
  status,
  invitationId,
  name,
  mobileNumber,
  isInviteActionModalOpen,
  setIsInviteActionModalOpen,
}) => {
  const remindMutation = useMutation({
    mutationKey: [invitation.remindInvitation.endpointKey, invitationId],
    mutationFn: () => remindInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation Reminded Successfully');

      setIsInviteActionModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const resendMutation = useMutation({
    mutationKey: [invitation.resendInvitation.endpointKey, invitationId],
    mutationFn: () => resendInvitation(invitationId),
    onSuccess: () => {
      toast.success('Invitation Resend Successfully');

      setIsInviteActionModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const bgColorClass = getRandomBgColor();

  const clientStatus = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          infoText: 'Pending invite',
          ctaText: 'Remind',
        };
      case 'INVITE_SENT':
        return { infoText: 'Invite sent', ctaText: 'Remind' };
      case 'INVITE_REJECTED':
        return { infoText: 'Invite rejected', ctaText: 'Resend' };
      default:
        return null; // return null or an empty object instead of an empty string for consistency
    }
  };

  const getClientDataByStatus = clientStatus(status);

  return (
    <Dialog
      open={isInviteActionModalOpen}
      onOpenChange={setIsInviteActionModalOpen}
    >
      <DialogTrigger className="flex cursor-default items-center gap-1 px-2">
        <Dot size={24} />
        <span>{getClientDataByStatus?.infoText}</span>
        <span className="cursor-pointer px-2 text-primary hover:underline">
          {getClientDataByStatus?.ctaText}
        </span>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>{getClientDataByStatus?.infoText}</DialogTitle>
        <div className="flex flex-col gap-4 rounded-sm border pb-3 pl-3 pr-3 pt-5">
          <div className="flex items-start gap-4">
            <span
              className={`flex items-center justify-center rounded-full ${bgColorClass} p-2 text-sm text-white`}
            >
              {getInitialsNames(name)}
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-bold">
                {`You are adding “${name}” as your Client`}
              </span>
              <span className="flex items-center gap-2 text-xs text-[#A5ABBD]">
                <p>+91 {mobileNumber ?? '-'} </p>
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            {status === 'PENDING' || status === 'INVITE_SENT' ? (
              <Button size="sm" onClick={() => remindMutation.mutate()}>
                Remind
              </Button>
            ) : (
              <Button size="sm" onClick={() => resendMutation.mutate()}>
                Resend
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationActionModal;
