'use client';

import { getStylesForSelectComponent } from '@/appUtils/helperFunctions';
import { AuthProgressProvider } from '@/context/AuthProgressContext';
import { UserDataProvider } from '@/context/UserDataContext';
import useClarityTracking from '@/hooks/useClarityTracking';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Select from 'react-select';
import HeroSection from '../(landing-page)/page';

function AutoScrollingLandingPage() {
  const containerRef = useRef(null);
  const isHoveredRef = useRef(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return () => {};

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const { width } = entry.contentRect;
        const baseWidth = 1280; // Render at standard desktop resolution
        const newScale = width / baseWidth;
        setScale(newScale || 1);
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return () => {};

    let animationFrameId;
    let scrollPos = 0;
    const speed = 0.2; // Slower smooth scroll speed (pixels per frame)

    const scroll = () => {
      if (!container) return;
      if (!isHoveredRef.current) {
        // Adjust scroll speed according to the scale factor
        const step = scale > 0 ? speed / scale : speed;
        scrollPos += step;
        const singlePageHeight = container.scrollHeight / 2;

        if (scrollPos >= singlePageHeight) {
          scrollPos = 0;
        }
        container.scrollTop = scrollPos;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [scale]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className="no-scrollbar absolute inset-0 z-0 select-none overflow-y-auto overflow-x-hidden"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `,
        }}
      />
      <div
        className="pointer-events-none flex origin-top-left flex-col"
        style={{
          width: '1280px',
          transform: `scale(${scale})`,
        }}
      >
        <div className="w-full shrink-0">
          <HeroSection isEmbed={true} />
        </div>
        <div className="w-full shrink-0">
          <HeroSection isEmbed={true} />
        </div>
      </div>
    </div>
  );
}

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

    // Set the cookie manually (expires in 1 year)
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    const currentPathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    setIsLoading(true);
    // Force a full page reload to ensure server picks up cookie
    window.location.href = `/${newLocale}${currentPathWithoutLocale}`;
  };

  useClarityTracking();

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

          <div className="relative hidden w-1/2 overflow-hidden border-l border-gray-200 bg-custom-linear md:block">
            {/* Language switcher */}
            <div className="absolute right-2 top-1 z-10 p-2">
              <Select
                name="language"
                options={optionsOfLanguages}
                styles={getStylesForSelectComponent()}
                className="w-36 rounded-[9px] text-sm font-semibold shadow-lg"
                classNamePrefix="select"
                value={selectedLanguage} // Maintain selected value
                onChange={handleChange}
              />
            </div>

            <AutoScrollingLandingPage />
          </div>
        </div>
      </AuthProgressProvider>
    </UserDataProvider>
  );
}
