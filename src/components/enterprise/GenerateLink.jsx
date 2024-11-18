import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '../ui/button';

const GenerateLink = ({ invitationStatus, invitationId, mutationFunc }) => {
  const generateLinkMutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: (data) => {
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`,
      );
      toast.success('Link Generated & Copied to clipboard');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleClick = () => {
    generateLinkMutation.mutate(invitationId);
  };

  return invitationStatus === 'PENDING' || invitationStatus === 'REJECTED' ? (
    <Button size="sm" onClick={handleClick}>
      Link
    </Button>
  ) : (
    <span className="rounded-sm border border-green-600 bg-green-100 p-2 font-bold text-green-600">
      Accepted
    </span>
  );
};

export default GenerateLink;
