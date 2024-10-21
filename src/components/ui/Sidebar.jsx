import React from 'react';

import {
  Bell,
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
  Users,
} from 'lucide-react';
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
      name: 'Inventories',
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
    {
      name: 'Members',
      icon: <Users size={16} />,
      path: '/members',
    },
    {
      name: 'Notifications',
      icon: <Bell size={16} />,
      path: '/notification',
    },
    // {
    //   name: "Insights",
    //   icon: <PieChart size={16} />,
    //   path: "/insights",
    // },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white p-2 shadow-[0_4px_6px_0_#3288ED1A]">
      {links.map((link) => (
        <StyledLinks key={link.name} link={link} />
      ))}
    </div>
  );
};

export default Sidebar;
