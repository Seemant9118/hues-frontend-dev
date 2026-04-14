'use client';

import React, { useMemo } from 'react';

import { capitalize, roleColors } from '@/appUtils/helperFunctions';
import { goToHomePage } from '@/appUtils/redirectionUtilFn';
import { useAuth } from '@/context/AuthContext';
import { useFeatureFlags } from '@/context/FeatureFlagContext';
import { useSidebarLayout } from '@/context/SidebarLayoutContext';
import { usePermission } from '@/hooks/usePermissions';
import { Link } from '@/i18n/routing';
import {
  ArchiveRestore,
  ArrowRightLeft,
  Banknote,
  Bell,
  Blocks,
  BookOpen,
  Boxes,
  ClipboardList,
  Cuboid,
  Database,
  FileCheck,
  FileSignature,
  FileSymlink,
  FileText,
  Gauge,
  GitGraph,
  HandCoins,
  HandPlatter,
  IndianRupee,
  NotebookTabs,
  NotepadText,
  Package,
  PencilRuler,
  ReceiptIndianRupee,
  ReceiptText,
  ScrollText,
  Shapes,
  ShieldCheck,
  ShoppingCart,
  SquareKanban,
  Store,
  Truck,
  UserRound,
  Users,
  Warehouse,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import EnterpriseSelectorPopUp from '../Popovers/EnterpriseSelectorPopUp';
import ProfileInfoPopUp from '../Popovers/ProfileInfoPopUp';
import Tooltips from '../auth/Tooltips';
import Avatar from './Avatar';
import StyledLinks from './StyledLinks';
import { Badge } from './badge';
import { TooltipProvider } from './tooltip';

const PERMISSIONS = {
  VIEW_DASHBOARD: 'permission:view-dashboard',
  ADMIN_DASHBOARD: 'permission:admin-dashboard-view',
  ITEM_MASTERS: 'permission:item-masters-view',
  SALES: 'permission:sales-view',
  PURCHASE: 'permission:purchase-view',
  CLIENTS: 'permission:clients-view',
  VENDORS: 'permission:vendors-view',
  CUSTOMERS: 'permission:customers-view',
  MEMBERS: 'permission:members-view',
};

const ICON_SIZE = 16;

const Sidebar = () => {
  const { name, roles } = useAuth();
  const { isRouteEnabled } = useFeatureFlags();
  const { isCollapsed, toggleSidebar } = useSidebarLayout();
  const { hasPermission } = usePermission();
  const router = useRouter();

  const isEnterpriseSwitched = Boolean(
    typeof window !== 'undefined' &&
      localStorage.getItem('switchedEnterpriseId'),
  );

  const adminLinks = useMemo(() => {
    if (!hasPermission(PERMISSIONS.ADMIN_DASHBOARD)) return [];

    return [
      {
        name: 'sidebar.reports',
        icon: <SquareKanban size={ICON_SIZE} />,
        path: '/dashboard/admin/reports',
      },
      {
        name: 'sidebar.data',
        icon: <Database size={ICON_SIZE} />,
        path: '/dashboard/admin/data',
      },
      {
        name: 'sidebar.goods-master',
        icon: <Shapes size={ICON_SIZE} />,
        path: '/dashboard/admin/goods-master/category',
        subTab: [
          {
            name: 'sidebar.subTabs.goods-category',
            icon: <Blocks size={ICON_SIZE} />,
            path: '/dashboard/admin/goods-master/category',
          },
          {
            name: 'sidebar.subTabs.goods-subCategory',
            icon: <Cuboid size={ICON_SIZE} />,
            path: '/dashboard/admin/goods-master/sub-category',
          },
          {
            name: 'sidebar.subTabs.goods-master',
            icon: <Boxes size={ICON_SIZE} />,
            path: '/dashboard/admin/goods-master/goods-master',
          },
        ],
      },
      {
        name: 'sidebar.services-master',
        icon: <PencilRuler size={ICON_SIZE} />,
        path: '/dashboard/admin/services-master/service-master',
        subTab: [
          {
            name: 'sidebar.subTabs.services-master',
            icon: <HandPlatter size={ICON_SIZE} />,
            path: '/dashboard/admin/services-master/service-master',
          },
        ],
      },
      {
        name: 'sidebar.rulesEngine',
        icon: <GitGraph size={ICON_SIZE} />,
        path: '/dashboard/admin/rules-engine',
      },
    ];
  }, [hasPermission]);

  const contactSubTabs = useMemo(() => {
    const tabs = [
      hasPermission(PERMISSIONS.CLIENTS) && {
        name: 'sidebar.subTabs.clients',
        icon: <UserRound size={ICON_SIZE} />,
        path: '/dashboard/clients',
      },
      hasPermission(PERMISSIONS.VENDORS) && {
        name: 'sidebar.subTabs.vendors',
        icon: <Store size={ICON_SIZE} />,
        path: '/dashboard/vendors',
      },
      hasPermission(PERMISSIONS.CUSTOMERS) && {
        name: 'sidebar.subTabs.customers',
        icon: <ShoppingCart size={ICON_SIZE} />,
        path: '/dashboard/customers',
      },
    ].filter(Boolean);
    return tabs;
  }, [hasPermission]);

  const contactsLink = useMemo(
    () => ({
      name: 'sidebar.contacts',
      icon: <NotebookTabs size={ICON_SIZE} />,
      path: contactSubTabs[0]?.path || '/dashboard/clients',
      subTab: contactSubTabs,
    }),
    [contactSubTabs],
  );

  const mainLinks = useMemo(() => {
    const links = [
      hasPermission(PERMISSIONS.VIEW_DASHBOARD) && {
        name: 'sidebar.dashboard',
        icon: <Gauge size={ICON_SIZE} />,
        path: '/dashboard',
      },
      hasPermission(PERMISSIONS.ITEM_MASTERS) && {
        name: 'sidebar.itemMaster-goods',
        icon: <Package size={ICON_SIZE} />,
        path: '/dashboard/inventory/goods',
        subTab: [
          {
            name: 'sidebar.subTabs.goods',
            icon: <Boxes size={ICON_SIZE} />,
            path: '/dashboard/inventory/goods',
          },
          {
            name: 'sidebar.subTabs.transactions',
            icon: <ArrowRightLeft size={ICON_SIZE} />,
            path: '/dashboard/inventory/transactions',
          },
          {
            name: 'sidebar.subTabs.stocks',
            icon: <Warehouse size={ICON_SIZE} />,
            path: '/dashboard/inventory/stocks',
          },
          {
            name: 'sidebar.subTabs.qc',
            icon: <ShieldCheck size={ICON_SIZE} />,
            path: '/dashboard/inventory/qc',
          },
        ],
      },
      hasPermission(PERMISSIONS.ITEM_MASTERS) && {
        name: 'sidebar.itemMaster-services',
        icon: <HandCoins size={ICON_SIZE} />,
        path: '/dashboard/inventory/services',
        subTab: [
          {
            name: 'sidebar.subTabs.services',
            icon: <HandPlatter size={ICON_SIZE} />,
            path: '/dashboard/inventory/services',
          },
        ],
      },
      hasPermission(PERMISSIONS.SALES) &&
        isRouteEnabled('/dashboard/transport') && {
          name: 'sidebar.transport',
          icon: <Truck size={ICON_SIZE} />,
          path: '/dashboard/transport/dispatch',
          subTab: [
            isRouteEnabled('/dashboard/transport/dispatch') && {
              name: 'sidebar.subTabs.dispatch',
              icon: <ArchiveRestore size={ICON_SIZE} />,
              path: '/dashboard/transport/dispatch',
            },
            isRouteEnabled('/dashboard/transport/delivery-challan') && {
              name: 'sidebar.subTabs.deliveryChallan',
              icon: <ReceiptText size={ICON_SIZE} />,
              path: '/dashboard/transport/delivery-challan',
            },
            isRouteEnabled('/dashboard/transport/pod') && {
              name: 'sidebar.subTabs.pod',
              icon: <FileSignature size={ICON_SIZE} />,
              path: '/dashboard/transport/pod',
            },
            isRouteEnabled('/dashboard/transport/grn') && {
              name: 'sidebar.subTabs.grn',
              icon: <NotepadText size={ICON_SIZE} />,
              path: '/dashboard/transport/grn',
            },
          ].filter(Boolean),
        },
      hasPermission(PERMISSIONS.SALES) &&
        isRouteEnabled('/dashboard/accounting/trial-balance') && {
          name: 'sidebar.accounting',
          icon: <Banknote size={ICON_SIZE} />,
          path: '/dashboard/accounting/trial-balance',
          subTab: [
            {
              name: 'sidebar.subTabs.trialBalance',
              icon: <BookOpen size={ICON_SIZE} />,
              path: '/dashboard/accounting/trial-balance',
            },
          ],
        },
      hasPermission(PERMISSIONS.SALES) && {
        name: 'sidebar.statutory',
        icon: <ReceiptIndianRupee size={ICON_SIZE} />,
        path: '/dashboard/statutory/gst',
        subTab: [
          {
            name: 'sidebar.subTabs.gst',
            icon: <FileText size={ICON_SIZE} />,
            path: '/dashboard/statutory/gst',
          },
        ],
      },
      hasPermission(PERMISSIONS.SALES) && {
        name: 'sidebar.sales',
        icon: <ClipboardList size={ICON_SIZE} />,
        path: '/dashboard/sales/sales-orders',
        subTab: [
          {
            name: 'sidebar.subTabs.orders',
            icon: <Boxes size={ICON_SIZE} />,
            path: '/dashboard/sales/sales-orders',
          },
          {
            name: 'sidebar.subTabs.invoices',
            icon: <ReceiptText size={ICON_SIZE} />,
            path: '/dashboard/sales/sales-invoices',
          },
          {
            name: 'sidebar.subTabs.payments',
            icon: <IndianRupee size={14} />,
            path: '/dashboard/sales/sales-payments',
          },
          {
            name: 'sidebar.subTabs.debitNotes',
            icon: <FileSymlink size={ICON_SIZE} />,
            path: '/dashboard/sales/sales-debitNotes',
          },
          {
            name: 'sidebar.subTabs.creditNotes',
            icon: <FileCheck size={ICON_SIZE} />,
            path: '/dashboard/sales/sales-creditNotes',
          },
        ],
      },
      hasPermission(PERMISSIONS.PURCHASE) && {
        name: 'sidebar.purchases',
        icon: <ScrollText size={ICON_SIZE} />,
        path: '/dashboard/purchases/purchase-orders',
        subTab: [
          {
            name: 'sidebar.subTabs.orders',
            icon: <Boxes size={ICON_SIZE} />,
            path: '/dashboard/purchases/purchase-orders',
          },
          {
            name: 'sidebar.subTabs.invoices',
            icon: <ReceiptText size={ICON_SIZE} />,
            path: '/dashboard/purchases/purchase-invoices',
          },
          {
            name: 'sidebar.subTabs.payments',
            icon: <IndianRupee size={14} />,
            path: '/dashboard/purchases/purchase-payments',
          },
          {
            name: 'sidebar.subTabs.debitNotes',
            icon: <FileSymlink size={ICON_SIZE} />,
            path: '/dashboard/purchases/purchase-debitNotes',
          },
          {
            name: 'sidebar.subTabs.creditNotes',
            icon: <FileCheck size={ICON_SIZE} />,
            path: '/dashboard/purchases/purchase-creditNotes',
          },
        ],
      },
      contactSubTabs.length > 0 && contactsLink,
      hasPermission(PERMISSIONS.MEMBERS) && {
        name: 'sidebar.members',
        icon: <Users size={ICON_SIZE} />,
        path: '/dashboard/members',
      },
    ].filter(Boolean);

    return links;
  }, [hasPermission, isRouteEnabled, contactSubTabs, contactsLink]);

  const actionLinks = useMemo(() => {
    return [
      hasPermission(PERMISSIONS.VIEW_DASHBOARD) && {
        name: 'sidebar.notifications',
        icon: <Bell size={ICON_SIZE} />,
        path: '/dashboard/notification',
      },
    ].filter(Boolean);
  }, [hasPermission]);

  const shouldShowMainLinks =
    (hasPermission(PERMISSIONS.ADMIN_DASHBOARD) && isEnterpriseSwitched) ||
    !hasPermission(PERMISSIONS.ADMIN_DASHBOARD);

  const handleProfileClick = () => {
    router.push('/dashboard/profile');
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter') {
      router.push('/dashboard/profile');
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside className="flex h-full flex-col justify-between overflow-hidden bg-[#F6F9FF] pb-0 pt-3 transition-[width] duration-300">
        <div
          className={`flex items-center ${isCollapsed ? 'flex-col gap-4 px-2' : 'justify-between px-3'}`}
        >
          <Link
            href={goToHomePage()}
            className={isCollapsed ? 'flex justify-center' : 'pl-0'}
          >
            <Image
              src={isCollapsed ? '/hues_logo.png' : '/hues_logo.png'}
              height={25}
              width={isCollapsed ? 46 : 100}
              placeholder="blur"
              alt="Logo"
              blurDataURL={isCollapsed ? '/hues_logo.png' : '/hues_logo.png'}
            />
          </Link>
          <button
            type="button"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!isCollapsed}
            onClick={toggleSidebar}
            className="rounded-sm border border-transparent p-1 text-gray-600 transition hover:border-gray-200 hover:bg-gray-100 hover:text-black"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={ICON_SIZE} />
            ) : (
              <PanelLeftClose size={ICON_SIZE} />
            )}
          </button>
        </div>

        <div
          className={`navScrollBarStyles mt-4 flex h-full flex-col justify-between gap-2 overflow-y-scroll pb-1 pr-1 transition-all duration-300 ${isCollapsed ? 'pl-2' : 'pl-3'}`}
        >
          <div className="flex flex-col gap-2">
            {adminLinks.length > 0 && (
              <nav className="flex flex-col gap-2 border-b py-1">
                {!isCollapsed && (
                  <span className="text-sm font-semibold">Admin</span>
                )}
                {adminLinks.map((link) => (
                  <StyledLinks
                    key={link.name}
                    link={link}
                    collapsed={isCollapsed}
                  />
                ))}

                <EnterpriseSelectorPopUp collapsed={isCollapsed} />
              </nav>
            )}

            {shouldShowMainLinks && (
              <div className="flex flex-col gap-2">
                {mainLinks.map((link) => (
                  <StyledLinks
                    key={link.name}
                    link={link}
                    collapsed={isCollapsed}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {shouldShowMainLinks && (
              <>
                {actionLinks.map((link) => (
                  <StyledLinks
                    key={link.name}
                    link={link}
                    collapsed={isCollapsed}
                  />
                ))}
              </>
            )}
            <ProfileInfoPopUp
              collapsed={isCollapsed}
              ctaName="sidebar.profile"
              viewProfileCta="components.profilePopUpInfo.viewProfileCta"
              enterprises="components.profilePopUpInfo.enterprises"
              addAnotherCta="components.profilePopUpInfo.addAnotherCta"
              logoutCta="components.profilePopUpInfo.logoutCta"
              accessDeniedCta="components.profilePopUpInfo.accessDeniedCta"
            />
          </div>
        </div>

        <div
          className={`flex w-full items-center gap-2 bg-gray-200 p-2 text-xs ${isCollapsed ? 'justify-center' : ''}`}
        >
          {isCollapsed ? (
            <Tooltips
              trigger={
                <div
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer"
                  onClick={handleProfileClick}
                  onKeyDown={handleKeyDown}
                >
                  <Avatar name={name} />
                </div>
              }
              content={'View User Profile'}
            />
          ) : (
            <Avatar name={name} />
          )}

          {!isCollapsed && (
            <div className="flex flex-1 flex-col flex-wrap gap-1">
              <Tooltips
                trigger={
                  <span
                    role="button"
                    tabIndex={0}
                    className="cursor-pointer truncate text-sm font-semibold leading-tight hover:underline"
                    onClick={handleProfileClick}
                    onKeyDown={handleKeyDown}
                  >
                    {capitalize(name)}
                  </span>
                }
                content={'View User Profile'}
              />

              <div className="flex flex-wrap gap-1">
                {roles?.length > 0 &&
                  roles.map((role, index) => {
                    const color = roleColors[index % roleColors.length];
                    return (
                      <Badge key={role} className={color}>
                        {role}
                      </Badge>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;
