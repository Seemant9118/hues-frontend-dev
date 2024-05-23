import React from "react";
import { Button } from "../ui/button";
import { Check, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { actionInvitation } from "@/services/Invitation_Service/Invitation_Service";
import { toast } from "sonner";

const InvitationBox = ({ name, mobileNumber, gstNumber, panNumber }) => {
  // const actionInvitationMutation = useMutation({
  //   mutationFn: () => actionInvitation(data),
  //   onSuccess: (data) => {
  //     toast.success()
  //   } 
  // });
  return (
    <div className="flex justify-between items-center py-2 px-5 bg-white rounded-md">
      <div className="grid grid-cols-4 gap-4 text-xs text-gray-600 font-semibold ">
        <span className="w-24  truncate">{name}</span>
        <span className="w-24  truncate">{mobileNumber}</span>
        <span className="w-24  truncate">{gstNumber}</span>
        <span className="w-24  truncate">{panNumber}</span>
      </div>
      <div className="flex gap-4 items-center">
        <Button className="h-9 w-34 bg-red-500 hover:bg-red-700">
          <X size={20} className="cursor-pointer" />
        </Button>
        <Button className="h-9 w-34 bg-green-500 hover:bg-green-700">
          <Check />
        </Button>
      </div>
    </div>
  );
};

export default InvitationBox;
