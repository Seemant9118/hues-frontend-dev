'use client';

import { CheckCircle2, RefreshCw } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function SharedFormSuccess({ submissionResult }) {
  const submissionId = submissionResult?.id;
  const createdAt = submissionResult?.createdAt
    ? new Date(submissionResult.createdAt).toLocaleString()
    : new Date().toLocaleString();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-8 text-center">
      <Card className="rounded-2xl border-neutral-200 bg-white p-4 shadow-xl sm:p-6">
        <CardHeader className="items-center text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <CardTitle className="mt-4 text-xl font-bold text-neutral-900 sm:text-2xl">
            Form Submitted Successfully!
          </CardTitle>
          <CardDescription className="text-xs leading-relaxed text-neutral-500 sm:text-sm">
            Thank you for completing this form. Your submission has been
            securely recorded by our system.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Submission Details Card */}
          {submissionId && (
            <div className="rounded-xl border border-neutral-100 bg-neutral-50/80 p-4 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Submission ID:</span>
                <span className="font-mono font-bold text-neutral-800">
                  #{submissionId}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-neutral-500">Submitted At:</span>
                <span className="text-neutral-700">{createdAt}</span>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="gap-2"
            >
              <RefreshCw size={13} />
              <span>Submit Another Response</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
