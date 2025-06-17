'use client';

import React from 'react';

import { useRBAC } from '@/context/RBACcontext';
import { Link } from '@/i18n/routing';
import {
  Bell,
  Boxes,
  ClipboardList,
  Database,
  FileSymlink,
  Gauge,
  HandPlatter,
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
} from 'lucide-react';
import Image from 'next/image';
import ProfileInfoPopUp from '../Popovers/ProfileInfoPopUp';
import StyledLinks from './StyledLinks';

const Sidebar = () => {
  const { hasPageAccess } = useRBAC();

  const adminLinks = hasPageAccess('adminReports')
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
  const links = [
    {
      name: 'sidebar.dashboard',
      icon: <Gauge size={16} />,
      path: `/dashboard`,
    },
    // {
    //   name: 'Templates',
    //   icon: <LayoutDashboard size={16} />,
    //   path: '/template',
    // },
    {
      name: 'sidebar.itemMaster',
      icon: <Package size={16} />,
      path: '/dashboard/inventory/goods',
      subTab: [
        {
          name: 'sidebar.subTabs.goods',
          icon: <Boxes size={16} />,
          path: '/dashboard/inventory/goods',
        },
        {
          name: 'sidebar.subTabs.services',
          icon: <HandPlatter size={16} />,
          path: '/dashboard/inventory/services',
        },
      ],
    },
    // {
    //   name: 'sidebar.catalogue',
    //   icon: <BookOpenText size={16} />,
    //   path: '/catalogue',
    // },
    {
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
    {
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
    {
      name: 'sidebar.contacts',
      icon: <NotebookTabs size={16} />,
      path: '/dashboard/clients',
      subTab: [
        {
          name: 'sidebar.subTabs.clients',
          icon: <UserRound size={16} />,
          path: '/dashboard/clients',
        },
        {
          name: 'sidebar.subTabs.vendors',
          icon: <Store size={16} />,
          path: '/dashboard/vendors',
        },
        {
          name: 'sidebar.subTabs.customers',
          icon: <ShoppingCart size={16} />,
          path: '/dashboard/customers',
        },
      ],
    },

    // {
    //   name: 'Members',
    //   icon: <Users size={16} />,
    //   path: '/members',
    // },

    // {
    //   name: "Insights",
    //   icon: <PieChart size={16} />,
    //   path: "/insights",
    // },
  ];

  const actionLinks = [
    {
      name: 'sidebar.notifications',
      icon: <Bell size={16} />,
      path: '/dashboard/notification',
    },
    {
      name: 'sidebar.settings',
      icon: <Settings size={16} />,
      path: '/dashboard/settings',
    },
  ];

  return (
    <aside className="flex flex-col gap-10 overflow-hidden bg-[#F6F9FF] pb-3 pl-3 pt-3">
      <Link href="/dashboard">
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
            </nav>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <StyledLinks key={link.name} link={link} />
            ))}
          </nav>
        </div>

        {/* Action Links & Profile */}
        <div className="flex flex-col gap-2">
          {actionLinks.map((link) => (
            <StyledLinks key={link.name} link={link} />
          ))}

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
