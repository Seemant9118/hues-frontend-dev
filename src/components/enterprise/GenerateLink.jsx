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

  switch (invitationStatus) {
    case 'PENDING':
      return (
        <Button size="sm" onClick={handleClick}>
          Link
        </Button>
      );
    case 'REJECTED':
      return (
        <span className="rounded-sm border border-red-600 bg-red-100 p-2 text-red-600">
          Rejected
        </span>
      );

    case 'ACCEPTED':
      return (
        <span className="rounded-sm border border-green-600 bg-green-100 p-2 text-green-600">
          Accepted
        </span>
      );
    default:
      return null;
  }
};

export default GenerateLink;
