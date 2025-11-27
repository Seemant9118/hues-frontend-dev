'use client';

import React from 'react';

import { goToHomePage } from '@/appUtils/helperFunctions';
import { usePermission } from '@/hooks/usePermissions';
import { Link } from '@/i18n/routing';
import {
  Bell,
  Boxes,
  ClipboardList,
  Database,
  FileSymlink,
  Gauge,
  IndianRupee,
  NotebookTabs,
  Package,
  ReceiptText,
  ScrollText,
  Settings,
  ShoppingCart,
  SquareKanban,
  Store,
  UserRound,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import EnterpriseSelectorPopUp from '../Popovers/EnterpriseSelectorPopUp';
import ProfileInfoPopUp from '../Popovers/ProfileInfoPopUp';
import StyledLinks from './StyledLinks';

const Sidebar = () => {
  const { hasPermission } = usePermission();
  const isEnterpriseSwitched = Boolean(
    localStorage.getItem('switchedEnterpriseId'),
  );

  const adminLinks = hasPermission('permission:admin-dashboard-view')
    ? [
        {
          name: 'Reports',
          icon: <SquareKanban size={16} />,
          path: `/dashboard/admin/reports`,
        },
        {
          name: 'Data',
          icon: <Database size={16} />,
          path: `/dashboard/admin/data`,
        },
        // {
        //   name: 'Enterprise List',
        //   icon: <List size={16} />,
        //   path: `/admin/enterprises`,
        // },
      ]
    : [];

  // Build sub-tabs based on permissions
  const contactSubTabs = [
    hasPermission('permission:clients-view') && {
      name: 'sidebar.subTabs.clients',
      icon: <UserRound size={16} />,
      path: '/dashboard/clients',
    },
    hasPermission('permission:vendors-view') && {
      name: 'sidebar.subTabs.vendors',
      icon: <Store size={16} />,
      path: '/dashboard/vendors',
    },
    hasPermission('permission:customers-view') && {
      name: 'sidebar.subTabs.customers',
      icon: <ShoppingCart size={16} />,
      path: '/dashboard/customers',
    },
  ].filter(Boolean);

  // Use first valid sub-tab path as fallback
  const contactsLink = {
    name: 'sidebar.contacts',
    icon: <NotebookTabs size={16} />,
    path: contactSubTabs[0]?.path || '/dashboard/clients',
    subTab: contactSubTabs,
  };

  const links = [
    hasPermission('permission:view-dashboard') && {
      name: 'sidebar.dashboard',
      icon: <Gauge size={16} />,
      path: `/dashboard`,
    },
    hasPermission('permission:item-masters-view') && {
      name: 'sidebar.itemMaster',
      icon: <Package size={16} />,
      path: '/dashboard/inventory/goods',
      subTab: [
        {
          name: 'sidebar.subTabs.goods',
          icon: <Boxes size={16} />,
          path: '/dashboard/inventory/goods',
        },
        // {
        //   name: 'sidebar.subTabs.services',
        //   icon: <HandPlatter size={16} />,
        //   path: '/dashboard/inventory/services',
        // },
      ],
    },
    hasPermission('permission:sales-view') && {
      name: 'sidebar.sales',
      icon: <ClipboardList size={16} />,
      path: '/dashboard/sales/sales-orders',
      subTab: [
        {
          name: 'sidebar.subTabs.orders',
          icon: <Boxes size={16} />,
          path: '/dashboard/sales/sales-orders',
        },
        {
          name: 'sidebar.subTabs.invoices',
          icon: <ReceiptText size={16} />,
          path: '/dashboard/sales/sales-invoices',
        },
        {
          name: 'sidebar.subTabs.payments',
          icon: <IndianRupee size={14} />,
          path: '/dashboard/sales/sales-payments',
        },
        {
          name: 'sidebar.subTabs.debitNotes',
          icon: <FileSymlink size={16} />,
          path: '/dashboard/sales/sales-debitNotes',
        },
      ],
    },
    hasPermission('permission:purchase-view') && {
      name: 'sidebar.purchases',
      icon: <ScrollText size={16} />,
      path: '/dashboard/purchases/purchase-orders',
      subTab: [
        {
          name: 'sidebar.subTabs.orders',
          icon: <Boxes size={16} />,
          path: '/dashboard/purchases/purchase-orders',
        },
        {
          name: 'sidebar.subTabs.invoices',
          icon: <ReceiptText size={16} />,
          path: '/dashboard/purchases/purchase-invoices',
        },
        {
          name: 'sidebar.subTabs.payments',
          icon: <IndianRupee size={14} />,
          path: '/dashboard/purchases/purchase-payments',
        },
        {
          name: 'sidebar.subTabs.debitNotes',
          icon: <FileSymlink size={16} />,
          path: '/dashboard/purchases/purchase-debitNotes',
        },
      ],
    },
    contactSubTabs.length > 0 && contactsLink,
    hasPermission('permission:members-view') && {
      name: 'sidebar.members',
      icon: <Users size={16} />,
      path: '/dashboard/members',
    },
  ].filter(Boolean); // this removes all falsy values

  const actionLinks = [
    hasPermission('permission:view-dashboard') && {
      name: 'sidebar.notifications',
      icon: <Bell size={16} />,
      path: '/dashboard/notification',
    },
    hasPermission('permission:view-dashboard') && {
      name: 'sidebar.settings',
      icon: <Settings size={16} />,
      path: '/dashboard/settings',
    },
  ];

  return (
    <aside className="flex flex-col gap-10 overflow-hidden bg-[#F6F9FF] pb-3 pl-3 pt-3">
      <Link href={goToHomePage()}>
        <Image
          src="/hues_logo.png"
          height={25}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />
      </Link>

      {/* <div className="navScrollBarStyles flex h-full flex-col justify-between overflow-y-scroll pr-1"> */}

      <div className="navScrollBarStyles flex h-full flex-col justify-between gap-2 overflow-y-scroll pr-1">
        <div className="flex flex-col gap-2">
          {/* admin Navigation Links */}
          {adminLinks?.length > 0 && (
            <nav className="flex flex-col gap-2 border-b py-1">
              <span className="text-sm font-semibold">Admin</span>
              {adminLinks.map((link) => (
                <StyledLinks key={link.name} link={link} />
              ))}

              <EnterpriseSelectorPopUp />
            </nav>
          )}

          {/* Navigation Links */}
          {((hasPermission('permission:admin-dashboard-view') &&
            isEnterpriseSwitched) ||
            !hasPermission('permission:admin-dashboard-view')) && (
            <nav className="flex flex-col gap-2">
              {links.map((link) => (
                <StyledLinks key={link.name} link={link} />
              ))}
            </nav>
          )}
        </div>

        {/* Action Links & Profile */}
        <div className="flex flex-col gap-2">
          {((hasPermission('permission:admin-dashboard-view') &&
            isEnterpriseSwitched) ||
            !hasPermission('permission:admin-dashboard-view')) && (
            <>
              {actionLinks.map((link) => (
                <StyledLinks key={link.name} link={link} />
              ))}
            </>
          )}
          <ProfileInfoPopUp
            ctaName="sidebar.profile"
            viewProfileCta="components.profilePopUpInfo.viewProfileCta"
            enterprises="components.profilePopUpInfo.enterprises"
            addAnotherCta="components.profilePopUpInfo.addAnotherCta"
            logoutCta="components.profilePopUpInfo.logoutCta"
            accessDeniedCta="components.profilePopUpInfo.accessDeniedCta"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
