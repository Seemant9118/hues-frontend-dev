'use client';

import { useNotificationsCount } from '@/context/CountNotificationsContext';
import { Link, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

const ICON_SIZE = 14;
const NOTIFICATIONS_KEY = 'sidebar.notifications';

const StyledLinks = ({ link, collapsed = false }) => {
  const t = useTranslations('sidebar');
  const { totalUnreadNotifications } = useNotificationsCount();
  const pathname = usePathname();
  const [isSubTabShow, setIsSubTabShow] = useState(true);

  useEffect(() => {
    setIsSubTabShow(true);
  }, [pathname]);

  const getLabel = useMemo(() => {
    return (key) => {
      if (!key) return '';
      if (key.startsWith('sidebar.subTabs.') || key.startsWith('sidebar.')) {
        return t(key.replace('sidebar.', ''));
      }
      return key;
    };
  }, [t]);

  const label = useMemo(() => getLabel(link.name), [getLabel, link.name]);

  const isMainTabActive = useMemo(() => {
    return link.path === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(link.path);
  }, [link.path, pathname]);

  const isSubTabActive = useMemo(() => {
    return (
      link.subTab?.some((subtab) => pathname.startsWith(subtab.path)) ?? false
    );
  }, [link.subTab, pathname]);

  const isActive = useMemo(() => {
    return pathname === link.path || isSubTabActive;
  }, [pathname, link.path, isSubTabActive]);

  const isNotificationsLink = link.name === NOTIFICATIONS_KEY;
  const showBadge = isNotificationsLink && totalUnreadNotifications > 0;
  const hasSubTabs = link.subTab?.length > 0;

  const mainLink = (
    <Link
      href={link.path}
      aria-label={label}
      aria-current={isMainTabActive || isSubTabActive ? 'page' : undefined}
      className={cn(
        'flex w-full items-center rounded-sm border-none text-sm transition-all duration-300',
        collapsed ? 'justify-center p-3' : 'justify-between gap-2 p-3',
        (collapsed ? isActive : isMainTabActive && !isSubTabActive)
          ? 'bg-[#288AF91A] text-[#288AF9]'
          : 'bg-transparent text-gray-600 hover:text-black',
      )}
    >
      <span
        className={cn(
          'flex items-center',
          collapsed
            ? 'justify-center'
            : isSubTabActive
              ? 'gap-2 font-bold text-[#363940]'
              : 'w-full justify-between gap-2',
        )}
      >
        <span className="flex items-center gap-2">
          {link.icon}
          {!collapsed && label}
        </span>

        {!collapsed && showBadge && (
          <span className="rounded-full bg-[#FF4D4F] px-2 py-1 text-xs text-white">
            {totalUnreadNotifications}
          </span>
        )}
      </span>
    </Link>
  );

  const toggleSubTabs = () => {
    setIsSubTabShow((prev) => !prev);
  };

  return (
    <>
      <div className="flex w-full items-center justify-between rounded-sm text-xs">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{mainLink}</TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ) : (
          mainLink
        )}

        {!collapsed && hasSubTabs && isActive && (
          <button
            type="button"
            className="cursor-pointer rounded-sm p-1 hover:bg-gray-100"
            aria-label={`${isSubTabShow ? 'Collapse' : 'Expand'} ${label}`}
            aria-expanded={isSubTabShow}
            onClick={toggleSubTabs}
          >
            {isSubTabShow ? (
              <ChevronUp size={ICON_SIZE} />
            ) : (
              <ChevronDown size={ICON_SIZE} />
            )}
          </button>
        )}
      </div>

      {!collapsed && isSubTabShow && isActive && hasSubTabs && (
        <ul className="flex w-full flex-col gap-2 pl-10">
          {link.subTab.map((subtab) => {
            const isSubTabPathActive = pathname.startsWith(subtab.path);
            return (
              <li key={subtab.path}>
                <Link
                  href={subtab.path}
                  aria-current={isSubTabPathActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-sm border-none p-3 text-sm',
                    isSubTabPathActive
                      ? 'bg-[#288AF91A] text-[#288AF9]'
                      : 'bg-transparent text-gray-600 hover:text-black',
                  )}
                >
                  {subtab.icon}
                  {getLabel(subtab.name)}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

export default React.memo(StyledLinks);
