import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

const InvitationBox = ({ setInvitation, name="Name", number="9876543210", gst="1234567890123", pan="ABCDE1234F" }) => {
  return (
    <div className="flex justify-between items-center py-2 px-5 bg-white rounded-md">
      <div className="flex gap-5 text-xs text-gray-600 font-semibold">
        <span>{name}</span>
        <span>{number}</span>
        <span>{gst}</span>
        <span>{pan}</span>
      </div>
      <div className="flex gap-4 items-center">
        <X
          size={20}
          className="cursor-pointer"
        />
        <Button variant="blue_outline" className="h-9 w-34">
          Accept Invite
        </Button>
      </div>
    </div>
  );
};

export default InvitationBox;
