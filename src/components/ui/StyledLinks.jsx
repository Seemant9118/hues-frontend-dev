'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const StyledLinks = ({ link }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Tabs */}
      <Link
        href={link.path}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl border-none p-4 text-xs',
          pathname === link.path && pathname.includes(link.path)
            ? 'bg-[#288AF91A] text-[#288AF9]'
            : 'bg-transparent text-grey',
        )}
      >
        {link.icon}
        {link.name}
      </Link>

      {/* Sub Tabs */}
      {pathname === link.path ||
      pathname === link.subTab?.[0].path ||
      (pathname === link.subTab?.[1].path && link.subTab) ? (
        <ul className="flex w-full flex-col gap-2 pl-10">
          {link.subTab?.map((subtabs) => (
            <Link
              href={subtabs.path}
              key={subtabs.path}
              className={cn(
                'flex gap-2 rounded-xl border-none p-4 text-xs',
                pathname === subtabs.path
                  ? 'bg-[#288AF91A] text-[#288AF9]'
                  : 'bg-transparent text-grey',
              )}
            >
              {subtabs.icon}
              {subtabs.name}
            </Link>
          ))}
        </ul>
      ) : (
        ''
      )}
    </>
  );
};

export default StyledLinks;
