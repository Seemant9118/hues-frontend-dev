import React from "react";

import {
  Gauge,
  ClipboardList,
  LayoutDashboard,
  Package,
  PieChart,
  ScrollText,
  Store,
  UserRound,
  ReceiptText,
  ReceiptIndianRupee,
  BadgeIndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";
import StyledLinks from "@/components/StyledLinks";

const Sidebar = () => {
  const links = [
    {
      name: "Dashboard",
      icon: <Gauge size={16} />,
      path: "/",
    },
    {
      name: "Templates",
      icon: <LayoutDashboard size={16} />,
      path: "/template",
    },
    {
      name: "Inventory",
      icon: <Package size={16} />,
      path: "/inventory",
    },
    {
      name: "Sales Order",
      icon: <ClipboardList size={16} />,
      path: "/sales-orders",
    },
    {
      name: "Purchase Order",
      icon: <ScrollText size={16} />,
      path: "/purchase-orders",
    },
    {
      name: "Invoice",
      icon: <ReceiptText size={16} />,
      path: "/invoice",
      subTab: [
        {
          name: "Sale Invoices",
          icon: <BadgeIndianRupee  size={16}/>,
          path: "/invoice/sales-invoices"
        },
        {
          name: "Purchase Invoices",
          icon: <ReceiptIndianRupee size={16}/>,
          path: "/invoice/purchases-invoices"
        },
      ],
    },
    {
      name: "Client",
      icon: <UserRound size={16} />,
      path: "/clients",
    },
    {
      name: "Vendor",
      icon: <Store size={16} />,
      path: "/vendors",
    },
    {
      name: "Insights",
      icon: <PieChart size={16} />,
      path: "/insights",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_4px_6px_0_#3288ED1A] p-2 flex flex-col gap-2">
      {links.map((link) => (
        <StyledLinks key={link.name} link={link} />
      ))}
    </div>
  );
};

export default Sidebar;
