'use client';

import { useNotificationsCount } from '@/context/CountNotificationsContext';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

const StyledLinks = ({ link }) => {
  const t = useTranslations('sidebar');
  const { totalUnreadNotifications } = useNotificationsCount();
  const pathname = usePathname();
  const [isSubTabShow, setIsSubTabShow] = useState(null);

  useEffect(() => {
    setIsSubTabShow(true);
  }, [pathname]);

  const getLabel = (key) => {
    if (!key) return '';

    if (key.startsWith('sidebar.subTabs.')) {
      return t(key.replace('sidebar.', ''));
    }

    if (key.startsWith('sidebar.')) {
      return t(key.replace('sidebar.', ''));
    }

    return key;
  };

  const isActive =
    pathname === link.path ||
    link.subTab?.some((subtab) => pathname.startsWith(subtab.path));

  const isMainTabActive =
    link.path === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(link.path);

  const isSubTabActive = link.subTab?.some((subtab) =>
    pathname.startsWith(subtab.path),
  );

  return (
    <>
      <div className="flex w-full items-center justify-between rounded-sm text-xs">
        <Link
          href={link.path}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-sm border-none p-3 text-sm',
            isMainTabActive && !isSubTabActive
              ? 'bg-[#288AF91A] text-[#288AF9]'
              : 'bg-transparent text-gray-600 hover:text-black',
          )}
        >
          <span
            className={
              isSubTabActive
                ? 'flex items-center gap-2 font-bold text-[#363940]'
                : 'flex w-full items-center justify-between gap-2'
            }
          >
            <span className="flex items-center gap-2">
              {link.icon}
              {getLabel(link.name)}
            </span>

            {link.name === 'sidebar.notifications' &&
              totalUnreadNotifications > 0 && (
                <span className="rounded-full bg-[#FF4D4F] px-2 py-1 text-xs text-white">
                  {totalUnreadNotifications}
                </span>
              )}
          </span>
        </Link>

        {link?.subTab?.length > 0 && (
          <span className="cursor-pointer">
            {isActive ? (
              isSubTabShow ? (
                <ChevronUp size={14} onClick={() => setIsSubTabShow(false)} />
              ) : (
                <ChevronDown size={14} onClick={() => setIsSubTabShow(true)} />
              )
            ) : null}
          </span>
        )}
      </div>

      {isSubTabShow && isActive && link.subTab?.length > 0 && (
        <ul className="flex w-full flex-col gap-2 pl-10">
          {link.subTab.map((subtab) => (
            <li key={subtab.path}>
              <Link
                href={subtab.path}
                className={cn(
                  'flex items-center gap-2 rounded-sm border-none p-3 text-sm',
                  pathname.startsWith(subtab.path)
                    ? 'bg-[#288AF91A] text-[#288AF9]'
                    : 'bg-transparent text-gray-600 hover:text-black',
                )}
              >
                {subtab.icon}
                {getLabel(subtab.name)}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default StyledLinks;
