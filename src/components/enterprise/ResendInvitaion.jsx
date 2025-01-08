import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRoundPlus } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

const ResendInvitation = ({ invalidateQuery, invitationId, mutationFunc }) => {
  const queryClient = useQueryClient();
  const resendInvitaionMutaion = useMutation({
    mutationFn: mutationFunc,
    onSuccess: () => {
      toast.success('Invitation Resent Successfully');
      queryClient.invalidateQueries([invalidateQuery]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const handleClick = () => {
    resendInvitaionMutaion.mutate(invitationId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full"
      onClick={handleClick}
      // className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
    >
      <UserRoundPlus size={14} />
      Resend
    </Button>
  );
};

export default ResendInvitation;
