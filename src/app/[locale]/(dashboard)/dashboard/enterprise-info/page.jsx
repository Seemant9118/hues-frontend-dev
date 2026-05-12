'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Wrapper from '@/components/wrappers/Wrapper';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { templateApi } from '@/api/templates_api/template_api';
import { getDocument } from '@/services/Template_Services/Template_Services';
import Avatar from '@/components/ui/Avatar';
import { capitalize, maskPanNumber } from '@/appUtils/helperFunctions';

export default function PublicEnterpriseProfileModal({ open, setOpen, data }) {
  const enterpriseData = data?.[0];

  const pvtUrl = enterpriseData?.logoUrl;
  // Fetch the PDF document using react-query
  const { data: publicUrl } = useQuery({
    queryKey: [templateApi.getS3Document.endpointKey, pvtUrl],
    queryFn: () => getDocument(pvtUrl),
    enabled: !!pvtUrl, // Only fetch if pvtUrl is available
    select: (res) => res.data.data,
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-xl max-w-3xl rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-base font-bold text-gray-900">
            Enterprise Profile
          </DialogTitle>
        </DialogHeader>

        {/* Body scroll area */}
        <div className="max-h-[75vh] overflow-y-auto px-6 py-2">
          <Wrapper className="p-0">
            {/* Logo Card */}
            <section className="mb-6 rounded-xl border bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {enterpriseData?.logoUrl ? (
                    <Image
                      src={publicUrl?.publicUrl}
                      alt="logo"
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <Avatar name={enterpriseData?.name} />
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {enterpriseData?.name || '-'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {' '}
                      +91 {enterpriseData?.mobileNumber || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Enterprise Information */}
            <section className="mb-6">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-600">
                Enterprise Information
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* Full Name */}
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {enterpriseData?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {enterpriseData?.email || '-'}
                  </p>
                </div>

                {/* Type */}
                <div>
                  <p className="text-xs text-gray-500">Invited you as a</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {capitalize(enterpriseData?.type) || '-'}
                  </p>
                </div>
                {/* Address */}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500">Address</p>
                  </div>

                  <div className="mt-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-gray-800">
                    <MapPin size={14} className="shrink-0 text-primary" />
                    <p className="line-clamp-2">
                      {enterpriseData?.address || '-'}
                    </p>
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <p className="text-xs text-gray-500">Mobile Number</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    +91 {enterpriseData?.mobileNumber || '-'}
                  </p>
                </div>
              </div>
            </section>

            {/* Business Identification */}
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-blue-600">
                Business Identification
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {/* PAN */}
                <div>
                  <p className="text-xs text-gray-500">PAN Card Number</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {maskPanNumber(enterpriseData?.panNumber)}
                  </p>
                </div>

                {/* GSTIN */}
                <div>
                  <p className="text-xs text-gray-500">GST IN</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {enterpriseData?.gstNumber || '-'}
                  </p>
                </div>

                {/* UDYAM */}
                <div>
                  <p className="text-xs text-gray-500">UDYAM</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {enterpriseData?.udyam || '-'}
                  </p>
                </div>
              </div>
            </section>
          </Wrapper>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-6 py-4">
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
