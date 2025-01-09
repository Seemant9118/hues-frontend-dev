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
      name: 'Dashboard',
      icon: <Gauge size={16} />,
      path: '/',
    },
    // {
    //   name: 'Templates',
    //   icon: <LayoutDashboard size={16} />,
    //   path: '/template',
    // },
    {
      name: 'Item Master',
      icon: <Package size={16} />,
      path: '/inventory/goods',
      subTab: [
        {
          name: 'Goods',
          icon: <Boxes size={16} />,
          path: '/inventory/goods',
        },
        {
          name: 'Services',
          icon: <HandPlatter size={16} />,
          path: '/inventory/services',
        },
      ],
    },
    {
      name: 'Catalogue',
      icon: <BookOpenText size={16} />,
      path: '/catalogue',
    },
    {
      name: 'Sales',
      icon: <ClipboardList size={16} />,
      path: '/sales/sales-orders',
      subTab: [
        {
          name: 'Orders',
          icon: <Boxes size={16} />,
          path: '/sales/sales-orders',
        },
        {
          name: 'Invoices',
          icon: <ReceiptText size={16} />,
          path: '/sales/sales-invoices',
        },
        {
          name: 'Debit Notes',
          icon: <FileSymlink size={16} />,
          path: '/sales/sales-debitNotes',
        },
      ],
    },
    {
      name: 'Purchases',
      icon: <ScrollText size={16} />,
      path: '/purchases/purchase-orders',
      subTab: [
        {
          name: 'Orders',
          icon: <Boxes size={16} />,
          path: '/purchases/purchase-orders',
        },
        {
          name: 'Invoices',
          icon: <ReceiptText size={16} />,
          path: '/purchases/purchase-invoices',
        },
        {
          name: 'Debit Notes',
          icon: <FileSymlink size={16} />,
          path: '/purchases/purchase-debitNotes',
        },
      ],
    },
    {
      name: 'Clients',
      icon: <UserRound size={16} />,
      path: '/clients',
    },
    {
      name: 'Vendors',
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
      name: 'Notifications',
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
        <ProfileInfoPopUp />
      </div>
    </div>
  );
};

export default Sidebar;
