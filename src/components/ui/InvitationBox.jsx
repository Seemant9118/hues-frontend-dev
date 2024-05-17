import React from "react";
import { Button } from "../ui/button";
import { X } from "lucide-react";

const InvitationBox = ({ setInvitation }) => {
  return (
    <div className="flex justify-between items-center mx-10 py-2 px-5  bg-[#FFFF] rounded-md shadow-[0_4px_6px_0_#3288ED1A]">
      <span>Enterprise Invitation</span>
      <div className="flex gap-4 items-center">
        <X
          size={20}
          className="cursor-pointer"
          onClick={() => setInvitation(false)}
        />
        <Button variant="blue_outline" className="h-9 w-34">
          Accept Invite
        </Button>
      </div>
    </div>
  );
};

export default InvitationBox;
