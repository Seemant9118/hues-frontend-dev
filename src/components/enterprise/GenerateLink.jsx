import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

const GenerateLink = ({ invitationStatus, invitationId, mutationFunc }) => {
  const translations = useTranslations('components.generate_link');

  const generateLinkMutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: (data) => {
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      );
      toast.success(translations('toasts.success'));
    },
    onError: (error) => {
      toast.error(error.response.data.message || translations('toasts.error'));
    },
  });

  const handleClick = () => {
    generateLinkMutation.mutate(invitationId);
  };

  switch (invitationStatus) {
    case 'PENDING':
      return (
        <Button
          size="20px"
          className="w-20 rounded-[6px] p-1.5"
          onClick={handleClick}
        >
          {translations('ctas_staus.pending')}
        </Button>
      );
    case 'REJECTED':
      return (
        <div className="flex w-20 items-center justify-center rounded-[6px] border border-red-500 bg-red-100 p-1 text-red-500">
          {translations('ctas_staus.rejected')}
        </div>
      );

    case 'ACCEPTED':
      return (
        <div className="flex w-20 items-center justify-center rounded-[6px] border border-green-500 bg-green-100 p-1 text-green-500">
          {translations('ctas_staus.accepted')}
        </div>
      );
    default:
      return '-';
  }
};

export default GenerateLink;
