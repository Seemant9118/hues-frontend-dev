'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const RequestedApprovalPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            Request sent, Wait for approval
          </h1>
          <p className="w-full text-center text-sm text-[#A5ABBD]">
            Request sent to added as an associate at enterprise
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          <Button variant="ghost" size="sm" className="w-full p-2">
            <ArrowLeft size={14} />
            Back
          </Button>
        </div>

        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-sm bg-gray-300 p-2 text-sm font-semibold text-[#121212] hover:underline"
        >
          Continue Anyway
        </Link>
      </div>
    </div>
  );
};

export default RequestedApprovalPage;
