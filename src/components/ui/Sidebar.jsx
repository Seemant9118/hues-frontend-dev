import React from 'react';

import {
  Bell,
  Boxes,
  ClipboardList,
  Gauge,
  HandPlatter,
  Package,
  ReceiptText,
  ScrollText,
  Store,
  UserRound,
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
      ],
    },
    {
      name: 'Purchases',
      icon: <ScrollText size={16} />,
      path: '/purchase-orders',
    },
    // {
    //   name: "Invoices",
    //   icon: <ReceiptText size={16} />,
    //   path: "/invoice",
    //   subTab: [
    //     {
    //       name: "Sale Invoices",
    //       icon: <BadgeIndianRupee size={16} />,
    //       path: "/invoice/sales-invoices"
    //     },
    //     {
    //       name: "Purchase Invoices",
    //       icon: <ReceiptIndianRupee size={16} />,
    //       path: "/invoice/purchases-invoices"
    //     },
    //   ],
    // },
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
