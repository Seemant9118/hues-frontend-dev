import React from "react";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const GenerateLink = ({ invitationStatus, invitationId, mutationFunc }) => {
  const generateLinkMutation = useMutation({
    mutationFn: mutationFunc,
    onSuccess: (data) => {
      navigator.clipboard.writeText(
        `${process.env.NEXT_PUBLIC_WEBSITE_URL}/login?invitationToken=${data.data.data}`
      );
      toast.success("Link Generated & Copied to clipboard");
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const handleClick = () => {
    generateLinkMutation.mutate(invitationId);
  };

  return invitationStatus === "PENDING" || invitationStatus === "REJECTED" ? (
    <Button onClick={handleClick}>Link</Button>
  ) : (
    <Button className="font-bold text-green-600 bg-green-100 hover:bg-green-100 hover:text-green-600 hover:cursor-text">
      Accepted
    </Button>
  );
};

export default GenerateLink;
