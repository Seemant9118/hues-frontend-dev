'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const RequestAccessPage = () => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex h-[350px] w-[450px] flex-col items-center justify-center gap-14">
        <div className="flex flex-col gap-4">
          <h1 className="w-full text-center text-2xl font-bold text-[#121212]">
            You are not added as an associate at EnterpriseName
          </h1>
          <p className="w-full text-center text-sm text-[#A5ABBD]">
            Request the enterprise to add you as an associate
          </p>
        </div>

        <div className="flex w-full flex-col gap-5">
          <Button size="sm" type="Submit" className="w-full bg-[#288AF9] p-2">
            Request Access
          </Button>

          <Button variant="ghost" size="sm" className="w-full p-2">
            <ArrowLeft size={14} />
            Back
          </Button>
        </div>

        <div className="flex w-full flex-col gap-14">
          <Link
            href="/"
            className="flex w-full items-center justify-center text-sm font-semibold text-[#121212] hover:underline"
          >
            Skip for Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessPage;
