'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const InactiveEnterprisePage = () => {
  const router = useRouter();

  const handleRaisedTicket = () => {
    // api call
    // redirect to ticket raised page
    router.push('/login/enterprise/ticket-raised');
  };

  const handleBack = () => {
    router.back();
  };
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Your enterprise is inactive
          </h1>
          <p className="w-full text-center text-sm text-[#A5ABBD]">
            The enterprise is inactive as per the records
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <Button
            size="sm"
            className="w-full bg-primary p-2"
            onClick={handleRaisedTicket}
          >
            Raised a support ticket
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full p-2"
            onClick={handleBack}
          >
            <ArrowLeft size={14} />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InactiveEnterprisePage;
