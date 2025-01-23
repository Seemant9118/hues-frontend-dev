'use client';

import AuthProgress from '@/components/auth/AuthProgress';
import Loading from '@/components/ui/Loading';
import { CreditCard, PackageCheck, Phone, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileLoginPage from './mobileLogin/page';

export default function Login() {
  const AuthProgressData = [
    {
      id: 1,
      icon: <Phone size={20} />,
      title: 'Mobile Verification',
      time: '2 min',
      isDone: true,
    },
    {
      id: 2,
      icon: <CreditCard size={20} />,
      title: 'PAN Verification',
      time: '3 min',
      isDone: false,
    },
    {
      id: 3,
      icon: <User size={20} />,
      title: 'Aadhar Verification',
      time: '2 min',
      isDone: false,
    },
    {
      id: 4,
      icon: <PackageCheck size={20} />,
      title: 'Confirmation',
      time: '1 min',
      isDone: false,
    },
  ];
  return (
    <>
      <Suspense fallback={Loading}>
        {/* Header */}
        <div className="bg-transparent px-8 py-5">
          <Link href={'/'}>
            <Image
              src={'/hues_logo.png'}
              height={30}
              width={100}
              placeholder="blur"
              alt="Logo"
              blurDataURL="/hues_logo.png"
            />
          </Link>
        </div>
        <div className="flex h-screen flex-col items-center pt-10">
          <AuthProgress AuthProgressData={AuthProgressData} />
          {/* Initial Page in auth */}
          <MobileLoginPage />
        </div>
      </Suspense>
    </>
  );
}
