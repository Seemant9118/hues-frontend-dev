'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeftCircle, Mail, Phone } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white px-6 py-12 text-gray-800">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 text-center">
        <Image
          src="/hues_logo.png"
          height={25}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />

        <h1 className="mb-2 text-2xl font-bold text-gray-800">Need Help?</h1>
        <p className="mb-10 text-gray-600">
          {`We're here to help you with any issues or questions you have. Choose
          an option below or reach out to our support team.`}
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border p-6 shadow-sm transition hover:shadow-md">
            <Mail className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="mb-2 text-lg font-semibold">Email Support</h2>
            <p className="mb-3 text-sm">
              {`Send us an email and we'll get back to you within 24 hours.`}
            </p>
            <a
              href="mailto:support@yourapp.com"
              className="font-medium text-primary hover:underline"
            >
              support@yourapp.com
            </a>
          </div>

          <div className="rounded-lg border p-6 shadow-sm transition hover:shadow-md">
            <Phone className="mx-auto mb-4 h-8 w-8 text-green-600" />
            <h2 className="mb-2 text-lg font-semibold">Phone Support</h2>
            <p className="mb-3 text-sm">
              Call our support team from 9AM to 6PM IST (Mon–Fri).
            </p>
            <a
              href="tel:+919869350874"
              className="font-medium text-green-600 hover:underline"
            >
              +91 9869350874
            </a>
          </div>
        </div>

        <Button
          size="sm"
          className="mt-10 inline-flex items-center gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeftCircle className="h-5 w-5" />
          Back
        </Button>
      </div>
    </div>
  );
}
