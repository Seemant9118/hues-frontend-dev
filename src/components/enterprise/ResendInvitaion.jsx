import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { toast } from 'sonner';

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
    <span
      onClick={handleClick}
      className="flex items-center justify-center gap-2 rounded-sm p-1 text-sm hover:cursor-pointer hover:bg-gray-300"
    >
      Resend Invitation
    </span>
  );
};

export default ResendInvitation;
