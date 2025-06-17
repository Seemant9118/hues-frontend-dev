'use client';

import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import { AuthProgressProvider } from '@/context/AuthProgressContext';
import { UserDataProvider } from '@/context/UserDataContext';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Select from 'react-select';

export default function LoginLayout({ children }) {
  const pathname = usePathname(); // Get current route path
  const [isLoading, setIsLoading] = useState(false);

  const optionsOfLanguages = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'हिन्दी' },
  ];

  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1]; // Get the first part of the path
  const selectedLanguage =
    optionsOfLanguages.find((opt) => opt.value === currentLocale) ||
    optionsOfLanguages[0];

  const handleChange = (selectedOption) => {
    const newLocale = selectedOption.value;

    // ✅ Set the cookie manually (expires in 1 year)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    const currentPathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    setIsLoading(true);
    // Force a full page reload to ensure server picks up cookie
    window.location.href = `/${newLocale}${currentPathWithoutLocale}`;
  };

  // if browser loading then show this
  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2">
        <Image
          src={'/hues_logo.png'}
          height={40}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <UserDataProvider>
      <AuthProgressProvider>
        <div className="fixed inset-0 flex">
          <div className="flex h-screen w-full flex-col bg-white md:w-1/2">
            {/* Fixed Header with logo */}
            <div className="shrink-0 px-8 py-5">
              <Link href={'/login'}>
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

            {/* Scrollable content area */}
            <div className="navScrollBarStyles flex-1 overflow-y-auto px-6 py-4">
              {children}
            </div>
          </div>

          <div className="relative w-1/2 bg-custom-linear pl-24 pt-20">
            {/* Language switcher */}
            <div className="absolute right-2 top-1 z-10 p-2">
              <Select
                name="language"
                options={optionsOfLanguages}
                styles={getStylesForSelectComponent()}
                className="w-36 text-sm font-semibold"
                classNamePrefix="select"
                value={selectedLanguage} // Maintain selected value
                onChange={handleChange}
              />
            </div>
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
