'use client';

import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const StyledLinks = ({ link }) => {
  const pathname = usePathname();
  const [isSubTabShow, setIsSubTabShow] = useState(null);

  useEffect(() => {
    setIsSubTabShow(true);
  }, [pathname]);

  // Check if current pathname matches the main tab or starts with the sub-tab path
  const isActive =
    pathname === link.path ||
    link.subTab?.some((subtab) => pathname.startsWith(subtab.path));

  const isMainTabActive = pathname === link.path;

  const isSubTabActive = link.subTab?.some((subtab) =>
    pathname.startsWith(subtab.path),
  );

  return (
    <>
      {/* Main Tab */}
      <div className="flex w-full items-center justify-between rounded-sm text-xs">
        <Link
          href={link.path}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-sm border-none p-3 text-xs',
            isMainTabActive && !isSubTabActive
              ? 'bg-[#288AF91A] text-[#288AF9]'
              : 'bg-transparent text-grey hover:text-black',
          )}
        >
          <span
            className={
              isSubTabActive
                ? 'flex gap-2 font-bold text-[#363940]'
                : 'flex gap-2'
            }
          >
            {link.icon}
            {link.name}
          </span>
        </Link>
        {link?.subTab?.length > 0 && (
          <span
            className={cn(
              'cursor-pointer',
              isSubTabActive ? 'text-[#363940]' : 'text-grey',
            )}
          >
            {link?.subTab?.length > 0 ? (
              isSubTabShow && isActive ? (
                <ChevronUp size={14} onClick={() => setIsSubTabShow(false)} />
              ) : (
                <ChevronDown size={14} onClick={() => setIsSubTabShow(true)} />
              )
            ) : (
              ''
            )}
          </span>
        )}
      </div>

      {/* Sub Tabs */}
      {isSubTabShow && isActive && link.subTab?.length > 0 && (
        <ul className="flex w-full flex-col gap-2 pl-10">
          {link.subTab.map((subtab) => (
            <Link
              href={subtab.path}
              key={subtab.path}
              className={cn(
                'flex gap-2 rounded-sm border-none p-3 text-xs',
                pathname.startsWith(subtab.path)
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
