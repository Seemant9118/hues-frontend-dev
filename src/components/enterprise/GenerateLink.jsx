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
    <Button onClick={handleClick}>Link</Button>
  ) : (
    <Button className="bg-green-100 font-bold text-green-600 hover:cursor-text hover:bg-green-100 hover:text-green-600">
      Accepted
    </Button>
  );
};

export default GenerateLink;
