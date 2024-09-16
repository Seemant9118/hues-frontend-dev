'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const StyledLinks = ({ link }) => {
  const pathname = usePathname();

  // Check if the current link or any of its sub-tabs are active
  const isActive =
    link.path === '/'
      ? pathname === '/' // Exact match for dashboard path
      : pathname.includes(link.path); // Use 'includes' for other paths

  const isSubTabActive = link.subTab?.some((subtabs) =>
    pathname.includes(subtabs.path),
  );

  return (
    <>
      {/* Tabs */}
      <Link
        href={link.path}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl border-none p-4 text-xs',
          isActive || isSubTabActive
            ? 'bg-[#288AF91A] text-[#288AF9]'
            : 'bg-transparent text-grey',
        )}
      >
        {link.icon}
        {link.name}
      </Link>

      {/* Sub Tabs */}
      {(isActive || isSubTabActive) && link.subTab ? (
        <ul className="flex w-full flex-col gap-2 pl-10">
          {link.subTab.map((subtabs) => (
            <Link
              href={subtabs.path}
              key={subtabs.path}
              className={cn(
                'flex gap-2 rounded-xl border-none p-4 text-xs',
                pathname.includes(subtabs.path)
                  ? 'bg-[#288AF91A] text-[#288AF9]'
                  : 'bg-transparent text-grey',
              )}
            >
              {subtabs.icon}
              {subtabs.name}
            </Link>
          ))}
        </ul>
      ) : null}
    </>
  );
};

export default StyledLinks;
