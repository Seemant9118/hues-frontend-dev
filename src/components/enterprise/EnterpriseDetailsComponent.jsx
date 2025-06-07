'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Wrapper from '../wrappers/Wrapper';

// eslint-disable-next-line no-unused-vars
export default function EnterpriseDetailsComponent({ enterpriseDetails }) {
  return (
    <Wrapper className="scrollBarStyles overflow-auto">
      {/* overview */}
      <div className="space-y-2 border-b px-2 py-4">
        <div className="flex w-full items-center justify-between gap-2">
          <h3 className="text-medium font-semibold text-gray-400">Overview</h3>

          <div className="flex justify-end">
            <Button size="sm" variant="blue_outline">
              Edit Details
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 grid-rows-2 gap-6">
          <div>
            <Label>Enterprise Name</Label>
            <p className="font-medium">Parth Enterprise (B2B)</p>
          </div>
          <div>
            <Label>Email</Label>
            <p className="font-medium">parth@gmail.com</p>
          </div>

          <div className="row-span-2">
            <Label>Address</Label>
          </div>

          <div>
            <Label>Enterprise Type</Label>
            <p className="font-medium">Public</p>
          </div>
          <div>
            <Label>Phone</Label>
            <p className="font-medium">+91 923-484-3292</p>
          </div>
        </div>
      </div>

      {/* document details */}
      <div className="space-y-2 px-2 py-4">
        <h3 className="text-medium font-semibold text-gray-400">
          Document Details
        </h3>
        <div className="grid grid-cols-2 items-end gap-6">
          {[
            { label: 'GST Number', value: '123445' },
            { label: 'CIN', value: '123' },
            { label: 'UDYAM', value: '00000' },
            { label: 'PAN', value: 'PANB23445' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-md border p-4"
            >
              <span className="flex flex-col gap-2">
                <Label>{label}</Label>
                <p className="font-semibold">{value}</p>
              </span>
              <Button size="sm" variant="blue_outline">
                Verify
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Account details */}
      <div className="space-y-2 border-b px-2 py-4">
        <h3 className="text-sm font-semibold">Bank Account Details</h3>
        <div className="flex items-center justify-between gap-2 rounded-md border p-4">
          <p className="text-sm font-semibold">
            Acc. No: 1344595959590 | IFSC : ISHS8283
          </p>
          <Button size="sm" variant="blue_outline">
            Verify
          </Button>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-2 px-2 py-4">
        <div className="flex w-full flex-col justify-between gap-4">
          <div className="flex w-full items-center justify-between gap-2">
            <h3 className="text-medium font-semibold text-gray-400">
              Payment Details
            </h3>
            <Button variant="blue_outline" size="sm">
              Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-between">
              <Label>Payment Terms</Label>
              <p className="mt-2 font-medium">
                Payment due 15 days after the invoice date
              </p>
            </div>

            <div className="flex flex-col justify-between">
              <Label>Due Date</Label>
              <p className="mt-2 font-medium">12/06/2025</p>
            </div>
          </div>
        </div>
      </div>

      {/* Director Details */}
      <div className="space-y-2 px-2 py-4">
        <div className="flex w-full flex-col justify-between gap-4">
          <div className="flex w-full items-center justify-between gap-2">
            <h3 className="text-medium font-semibold text-gray-400">
              Director Details
            </h3>
            <Button variant="blue_outline" size="sm">
              Edit Details
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col justify-between">
              <Label>Director Name</Label>
              <p className="mt-2 font-medium">Rathode</p>
            </div>

            <div className="flex flex-col justify-between">
              <Label>Phone</Label>
              <p className="mt-2 font-medium">+91 1234567890</p>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
