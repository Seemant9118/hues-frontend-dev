import { AuthProgressProvider } from '@/context/AuthProgressContext';
import { UserDataProvider } from '@/context/UserDataContext';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginLayout({ children }) {
  return (
    <UserDataProvider>
      <AuthProgressProvider>
        <div className="fixed inset-0 flex">
          <div className="w-1/2 bg-white">
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
            {children}
          </div>
          <div className="relative w-1/2 bg-custom-linear pl-24 pt-20">
            <Image
              src="/posterImageLogin.png"
              alt="bg-login"
              width={678}
              height={706}
              className="-rotate-6 rounded-md border object-cover p-2 shadow-[0px_0px_20px_rgba(35,90,155,0.1)]"
            />
          </div>
        </div>
      </AuthProgressProvider>
    </UserDataProvider>
  );
}
