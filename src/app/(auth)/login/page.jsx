'use client';

import Loading from '@/components/ui/Loading';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import MobileLoginPage from './mobileLogin/page';

export default function Login() {
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
        {/* Initial Page in auth */}
        <MobileLoginPage />
      </Suspense>
    </>
  );
}
