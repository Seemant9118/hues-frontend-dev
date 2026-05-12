'use client';

import { invitation } from '@/api/invitation/Invitation';
import {
  capitalize,
  getEnterpriseId,
  getInitialsNames,
  getRandomBgColor,
  maskPanNumber,
} from '@/appUtils/helperFunctions';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  acceptInvitation,
  rejectInvitation,
} from '@/services/Invitation_Service/Invitation_Service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useState } from 'react';
import AddEnterpriseAddressModal from '@/app/[locale]/(dashboard)/dashboard/enterprise-info/page';
import { Button } from '../ui/button';

const PendingInvitesModal = ({
  ctaName,
  invitesTitle,
  invitesDetails,
  acceptCtaName,
  rejectCtaName,
  acceptedMsg,
  rejectedMsg,
  data,
  isInviteModalOpen,
  setIsInviteModalOpen,
}) => {
  const translations = useTranslations();

  const queryClient = useQueryClient();
  const enterpriseId = getEnterpriseId();
  const [isEnterpriseInfoOpen, setIsEnterpriseInfoOpen] = useState(false);

  const acceptInvitationMutation = useMutation({
    mutationFn: (data) => acceptInvitation(data),
    onSuccess: () => {
      toast.success(translations(acceptedMsg));
      setIsInviteModalOpen(false);
      queryClient.invalidateQueries([
        invitation.getReceivedInvitation.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: (data) => rejectInvitation(data),
    onSuccess: () => {
      toast.success(translations(rejectedMsg));
      setIsInviteModalOpen(false);
      queryClient.invalidateQueries([
        invitation.getReceivedInvitation.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleAccept = (id) => {
    acceptInvitationMutation.mutate({
      enterpriseId,
      invitationId: id,
    });
  };

  const handleReject = (id) => {
    rejectInvitationMutation.mutate({
      enterpriseId,
      invitationId: id,
    });
  };

  const bgColorClass = getRandomBgColor();

  return (
    <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 bg-[#288AF9]" onClick={() => {}}>
          {translations(ctaName)}
        </Button>
      </DialogTrigger>
      <DialogContent className="flex flex-col justify-center gap-5">
        <DialogTitle>{translations(invitesTitle)}</DialogTitle>
        <div className="scrollBarStyles flex max-h-[400px] flex-col gap-3 overflow-y-auto px-1">
          {data &&
            data?.map((inviteItem) => (
              <div
                key={inviteItem}
                className="flex flex-col gap-4 rounded-sm border pb-3 pl-3 pr-3 pt-5"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex items-center justify-center rounded-full ${bgColorClass} p-2 text-sm text-white`}
                  >
                    {getInitialsNames(inviteItem?.name)}
                  </span>
                  <div className="flex flex-col gap-2">
                    <p className="text-sm font-bold">
                      &quot;
                      <span
                        onClick={() => setIsEnterpriseInfoOpen(true)}
                        className="tab-index-[0] cursor-pointer hover:text-primary hover:underline"
                      >{`${inviteItem?.name}`}</span>
                      &quot;
                      <span>{` ${translations(invitesDetails, { type: capitalize(inviteItem?.type) })}`}</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs text-[#A5ABBD]">
                      <span>+91 {inviteItem?.mobileNumber || '-'}</span>

                      {inviteItem?.panNumber ? (
                        <span>| {maskPanNumber(inviteItem?.panNumber)}</span>
                      ) : null}

                      {inviteItem?.gstNumber ? (
                        <span>| {inviteItem?.gstNumber}</span>
                      ) : null}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    className="border border-red-600 text-red-600 hover:border-none hover:bg-red-600 hover:text-white"
                    variant="outline"
                    onClick={() => handleReject(inviteItem.id)}
                  >
                    {translations(rejectCtaName)}
                  </Button>
                  <Button size="sm" onClick={() => handleAccept(inviteItem.id)}>
                    {translations(acceptCtaName)}
                  </Button>
                </div>
              </div>
            ))}
        </div>
        {isEnterpriseInfoOpen && (
          <AddEnterpriseAddressModal
            open={isEnterpriseInfoOpen}
            setOpen={setIsEnterpriseInfoOpen}
            data={data}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PendingInvitesModal;
