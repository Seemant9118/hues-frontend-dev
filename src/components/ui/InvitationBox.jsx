import React from "react";
import { Button } from "../ui/button";
import { Check, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  rejectInvitation,
} from "@/services/Invitation_Service/Invitation_Service";
import { toast } from "sonner";
import { LocalStorageService } from "@/lib/utils";
import { Invitation } from "@/api/invitation/Invitation";

const InvitationBox = ({ id, name, mobileNumber, gstNumber, panNumber }) => {
  const queryClient = useQueryClient();
 

  const enterpriseId = LocalStorageService.get("enterprise_Id");

  const acceptInvitationMutation = useMutation({
    mutationFn: (data) => acceptInvitation(data),
    onSuccess: (data) => {
      toast.success("Success");
      queryClient.invalidateQueries([
        Invitation.getReceivedInvitation.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const rejectInvitationMutation = useMutation({
    mutationFn: (data) => rejectInvitation(data),
    onSuccess: (data) => {
      toast.success("Rejected");
      queryClient.invalidateQueries([
        Invitation.getReceivedInvitation.endpointKey,
      ]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const handleAccept = (id) => {
    acceptInvitationMutation.mutate({
      enterprise_id: enterpriseId,
      invitation_id: id,
    });
  };

  const handleReject = (id) => {
    rejectInvitationMutation.mutate({
      enterprise_id: enterpriseId,
      invitation_id: id,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center py-2 px-5 bg-white rounded-md">
        <div className="grid grid-cols-4 gap-4 text-xs text-gray-600 font-semibold h-10 items-center">
          {name && <span className="w-24 truncate">{name}</span>}
          {mobileNumber && (
            <span className="w-24 truncate">{mobileNumber}</span>
          )}
          {gstNumber && <span className="w-24 truncate">{gstNumber}</span>}
          {panNumber && <span className="w-24 truncate">{panNumber}</span>}
        </div>
        <div className="flex gap-4 items-center">
          <Button
            className="h-9 w-34 bg-red-500 hover:bg-red-700"
            onClick={() => handleReject(id)}
          >
            <X size={20} className="cursor-pointer" />
          </Button>
          <Button
            className="h-9 w-34 bg-green-500 hover:bg-green-700"
            onClick={() => handleAccept(id)}
          >
            <Check />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvitationBox;
