import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import React from 'react';
import { toast } from 'sonner';

const ShareLinkToDirectorNew = ({ invitationUrl }) => {
  return (
    <div className="flex min-h-[400px] w-[450px] flex-col items-center gap-10">
      <div className="flex flex-col gap-4">
        <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
          Invite Sent
        </h1>
        <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
          Once it gets approved you can access the enterprise dashboard
        </p>
      </div>

      <div className="flex w-full flex-col gap-2">
        <Label htmlFor="link" className="font-medium text-[#121212]">
          Share invite link
        </Label>

        <div className="flex w-full items-center justify-between truncate rounded-sm border p-2 text-sm text-[#121212]">
          <span className="w-3/4 truncate font-semibold">{invitationUrl}</span>
          <Button
            className="w-1/4"
            size="sm"
            variant="blue_outline"
            onClick={() => {
              navigator.clipboard.writeText(invitationUrl);
              toast.success('Link Copied to clipboard');
            }}
          >
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkToDirectorNew;
