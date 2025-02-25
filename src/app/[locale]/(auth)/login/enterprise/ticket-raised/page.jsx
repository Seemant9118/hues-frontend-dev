'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

const TicketRaisedPage = () => {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <form className="flex min-h-[500px] w-[450px] flex-col items-center justify-center gap-10 rounded-md">
        <div className="flex flex-col items-center gap-6">
          <BadgeCheck size={48} className="text-primary" />
          <h1 className="max-w-sm text-center text-2xl font-bold text-[#121212]">
            Ticket raised successfully
          </h1>
          <p className="w-full text-center text-sm font-semibold text-[#A5ABBD]">
            {`Someone from the team will reach out and connect with you on
            "+9199999999". Thank you`}
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
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
      </form>
    </div>
  );
};

export default TicketRaisedPage;
