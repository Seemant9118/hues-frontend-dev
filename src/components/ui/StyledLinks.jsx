'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const StyledLinks = ({ link }) => {
  const pathname = usePathname();

  // Check if current pathname matches the main tab or any of the sub-tabs
  const isActive =
    pathname === link.path ||
    link.subTab?.some((subtab) => pathname === subtab.path);

  return (
    <>
      {/* Main Tab */}
      <Link
        href={link.path}
        className={cn(
          'flex w-full items-center gap-2 rounded-sm border-none p-3 text-xs',
          isActive
            ? 'bg-[#288AF91A] text-[#288AF9]'
            : 'bg-transparent text-grey',
        )}
      >
        {link.icon}
        {link.name}
      </Link>

      {/* Sub Tabs */}
      {isActive && link.subTab?.length > 0 && (
        <ul className="flex w-full flex-col gap-2 pl-10">
          {link.subTab.map((subtab) => (
            <Link
              href={subtab.path}
              key={subtab.path}
              className={cn(
                'flex gap-2 rounded-sm border-none p-3 text-xs',
                pathname === subtab.path
                  ? 'bg-[#288AF91A] text-[#288AF9]'
                  : 'bg-transparent text-grey',
              )}
            >
              {subtab.icon}
              {subtab.name}
            </Link>
          ))}
        </ul>
      )}
    </>
  );
};

export default StyledLinks;
