import React from "react";

import {
  ClipboardList,
  LayoutDashboard,
  Package,
  PieChart,
  ScrollText,
  Store,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import StyledLinks from "@/components/StyledLinks";

const Sidebar = () => {
  const links = [
    {
      name: "Templates",
      icon: <LayoutDashboard size={16} />,
      path: "/",
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
