import { invitation } from '@/api/invitation/Invitation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Loading from '@/components/ui/Loading';
import { generateLink } from '@/services/Invitation_Service/Invitation_Service';
import { useMutation } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { toast } from 'sonner';

const ShareLinkToDirectorNew = ({
  isManualGettingLink,
  invitationUrl,
  invitationId,
}) => {
  const translations = useTranslations('auth.enterprise.shareLinkToDirector');
  const getLinkMutation = useMutation({
    mutationKey: [invitation.generateLink.endpointKey],
    mutationFn: generateLink,
    onSuccess: (data) => {
      toast.success(translations('toast.copySuccess'));
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      );
    },
    onError: (error) => {
      toast.error(error.response.data.messages || translations('toast.error'));
    },
  });

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-start gap-8 sm:gap-5">
      <BadgeCheck size={48} className="text-primary" />
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          {isManualGettingLink
            ? translations('heading.manual')
            : translations('heading.auto')}
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          {translations('description')}
        </p>
      </div>

      {!isManualGettingLink && (
        <div className="flex w-full flex-col gap-2">
          <Label htmlFor="link" className="font-medium text-[#121212]">
            {translations('shareLinkLabel')}
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
                toast.success(translations('toast.copySuccess'));
              }}
            >
              {translations('copyButton')}
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
          {getLinkMutation?.isPending ? (
            <Loading />
          ) : (
            translations('getLinkButton')
          )}
        </Button>
      )}
    </div>
  );
};

export default ShareLinkToDirectorNew;
