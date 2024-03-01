"use client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const StyledLinks = ({ link }) => {
  const pathname = usePathname();
  return (
    <Link
      href={link.path}
      className={cn(
        "w-full  border-none text-xs gap-2 flex items-center  p-4 rounded-xl",
        pathname === link.path
          ? "text-[#288AF9] bg-[#288AF91A]"
          : "text-[#A5ABBD] bg-transparent"
      )}
    >
      {link.icon}
      {link.name}
    </Link>
  );
};

export default StyledLinks;
