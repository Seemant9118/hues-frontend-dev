'use client';

import React from 'react';

import { Link } from '@/i18n/routing';
import {
  Bell,
  Boxes,
  ClipboardList,
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
  Store,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import ProfileInfoPopUp from '../Popovers/ProfileInfoPopUp';
import StyledLinks from './StyledLinks';

const Sidebar = () => {
  // const adminLinks = [
  //   {
  //     name: 'Reports',
  //     icon: <SquareKanban size={16} />,
  //     path: `/admin/reports`,
  //   },
  //   {
  //     name: 'Enterprise List',
  //     icon: <List size={16} />,
  //     path: `/admin/enterprises`,
  //   },
  // ];

  const links = [
    {
      name: 'sidebar.dashboard',
      icon: <Gauge size={16} />,
      path: `/`,
    },
    // {
    //   name: 'Templates',
    //   icon: <LayoutDashboard size={16} />,
    //   path: '/template',
    // },
    {
      name: 'sidebar.itemMaster',
      icon: <Package size={16} />,
      path: '/inventory/goods',
      subTab: [
        {
          name: 'sidebar.subTabs.goods',
          icon: <Boxes size={16} />,
          path: '/inventory/goods',
        },
        {
          name: 'sidebar.subTabs.services',
          icon: <HandPlatter size={16} />,
          path: '/inventory/services',
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
      path: '/sales/sales-orders',
      subTab: [
        {
          name: 'sidebar.subTabs.orders',
          icon: <Boxes size={16} />,
          path: '/sales/sales-orders',
        },
        {
          name: 'sidebar.subTabs.invoices',
          icon: <ReceiptText size={16} />,
          path: '/sales/sales-invoices',
        },
        {
          name: 'sidebar.subTabs.payments',
          icon: <IndianRupee size={14} />,
          path: '/sales/sales-payments',
        },
        {
          name: 'sidebar.subTabs.debitNotes',
          icon: <FileSymlink size={16} />,
          path: '/sales/sales-debitNotes',
        },
      ],
    },
    {
      name: 'sidebar.purchases',
      icon: <ScrollText size={16} />,
      path: '/purchases/purchase-orders',
      subTab: [
        {
          name: 'sidebar.subTabs.orders',
          icon: <Boxes size={16} />,
          path: '/purchases/purchase-orders',
        },
        {
          name: 'sidebar.subTabs.invoices',
          icon: <ReceiptText size={16} />,
          path: '/purchases/purchase-invoices',
        },
        {
          name: 'sidebar.subTabs.payments',
          icon: <IndianRupee size={14} />,
          path: '/purchases/purchase-payments',
        },
        {
          name: 'sidebar.subTabs.debitNotes',
          icon: <FileSymlink size={16} />,
          path: '/purchases/purchase-debitNotes',
        },
      ],
    },
    {
      name: 'sidebar.contacts',
      icon: <NotebookTabs size={16} />,
      path: '/clients',
      subTab: [
        {
          name: 'sidebar.subTabs.clients',
          icon: <UserRound size={16} />,
          path: '/clients',
        },
        {
          name: 'sidebar.subTabs.vendors',
          icon: <Store size={16} />,
          path: '/vendors',
        },
        {
          name: 'sidebar.subTabs.customers',
          icon: <ShoppingCart size={16} />,
          path: '/customers',
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
      path: '/notification',
    },
    {
      name: 'sidebar.settings',
      icon: <Settings size={16} />,
      path: '/settings',
    },
  ];

  return (
    <aside className="flex flex-col gap-10 overflow-hidden bg-[#F6F9FF] pb-3 pl-3 pt-3">
      <Link href="/">
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
      {/* admin Navigation Links */}
      {/* <nav className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Admin</span>
          {adminLinks.map((link) => (
            <StyledLinks key={link.name} link={link} />
          ))}
        </nav> */}

      <div className="navScrollBarStyles flex h-full flex-col justify-between gap-2 overflow-y-scroll pr-1">
        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <StyledLinks key={link.name} link={link} />
          ))}
        </nav>

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
