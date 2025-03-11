import { invitation } from '@/api/invitation/Invitation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';
import { useMutation } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

const ShareLinkToDirectorNew = ({
  isManualGettingLink,
  invitationUrl,
  invitationId,
}) => {
  const getLinkMutation = useMutation({
    mutationKey: [invitation.generateLink.endpointKey],
    mutationFn: generateLink,
    onSuccess: (data) => {
      toast.success('Link Copied to clipboard');
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      );
    },
    onError: (error) => {
      toast.error(error.response.data.messages || 'Something went wrong');
    },
  });

  return (
    <div className="flex w-[450px] flex-col items-center justify-center gap-5">
      <BadgeCheck size={48} className="text-primary" />
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          {isManualGettingLink
            ? 'Already, Invitation Sent to director'
            : 'Invite Sent'}
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          Once it gets approved you can access the enterprise dashboard
        </p>
      </div>

      {!isManualGettingLink && (
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="link" className="font-medium text-[#121212]">
            Share invite link
          </Label>

          <div className="flex w-full items-center justify-between truncate rounded-sm border p-2 text-sm text-[#121212]">
            <span className="w-3/4 truncate font-semibold">
              {invitationUrl}
            </span>
            <Button
              className="w-1/6"
              size="sm"
              variant="blue_outline"
              onClick={() => {
                navigator.clipboard.writeText(invitationUrl);
                toast.success('Link Copied to clipboard');
              }}
            >
              Copy
            </Button>
          </div>
        </div>
      )}
      {isManualGettingLink && (
        <Button
          size="sm"
          className="w-full"
          onClick={() => {
            getLinkMutation.mutate(invitationId);
          }}
          disabled={getLinkMutation?.isPending}
        >
          {getLinkMutation?.isPending ? <Loading /> : 'Get Link'}
        </Button>
      )}
    </div>
  );
};

export default ShareLinkToDirectorNew;
