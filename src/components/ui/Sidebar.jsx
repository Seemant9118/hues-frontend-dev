import React from 'react';

import {
  Bell,
  BookOpenText,
  Boxes,
  ClipboardList,
  FileSymlink,
  Gauge,
  HandPlatter,
  Package,
  ReceiptText,
  ScrollText,
  Store,
  UserRound,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileInfoPopUp from '../Popovers/ProfileInfoPopUp';
import StyledLinks from './StyledLinks';

const Sidebar = () => {
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
    {
      name: 'sidebar.catalogue',
      icon: <BookOpenText size={16} />,
      path: '/catalogue',
    },
    {
      name: 'sidebar.sales',
      icon: <ClipboardList size={16} />,
      path: '/sales/sales-orders',
      subTab: [
        {
          name: 'sidebar.orders',
          icon: <Boxes size={16} />,
          path: '/sales/sales-orders',
        },
        {
          name: 'sidebar.invoices',
          icon: <ReceiptText size={16} />,
          path: '/sales/sales-invoices',
        },
        {
          name: 'sidebar.debitNotes',
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
          name: 'sidebar.orders',
          icon: <Boxes size={16} />,
          path: '/purchases/purchase-orders',
        },
        {
          name: 'sidebar.invoices',
          icon: <ReceiptText size={16} />,
          path: '/purchases/purchase-invoices',
        },
        {
          name: 'sidebar.debitNotes',
          icon: <FileSymlink size={16} />,
          path: '/purchases/purchase-debitNotes',
        },
      ],
    },
    {
      name: 'sidebar.clients',
      icon: <UserRound size={16} />,
      path: '/clients',
    },
    {
      name: 'sidebar.vendors',
      icon: <Store size={16} />,
      path: '/vendors',
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
  ];

  return (
    <div className="flex flex-col justify-between bg-[#F6F9FF] p-3">
      <div className="flex w-full flex-col gap-10 py-2">
        <Link href={'/'}>
          <Image
            src={'/hues_logo.png'}
            height={25}
            width={100}
            placeholder="blur"
            alt="Logo"
            blurDataURL="/hues_logo.png"
          />
        </Link>

        <div className="flex flex-col gap-2">
          {links.map((link) => (
            <StyledLinks key={link.name} link={link} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {actionLinks.map((link) => (
          <StyledLinks key={link.name} link={link} />
        ))}
        <ProfileInfoPopUp
          ctaName={'sidebar.profile'}
          viewProfileCta={'sidebar.profilePopUpInfo.viewProfileCta'}
          enterprises={'sidebar.profilePopUpInfo.enterprises'}
          addAnotherCta={'sidebar.profilePopUpInfo.addAnotherCta'}
          logoutCta={'sidebar.profilePopUpInfo.logoutCta'}
          accessDeniedCta={'sidebar.profilePopUpInfo.accessDeniedCta'}
        />
      </div>
    </div>
  );
};

export default Sidebar;
