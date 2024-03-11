"use client";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

const StyledLinks = ({ link }) => {
  const pathname = usePathname();
  return (
    <>
      {/* Tabs */}
      <Link
        href={link.path}
        className={cn(
          "w-full  border-none text-xs gap-2 flex items-center  p-4 rounded-xl",
          pathname === link.path && pathname.includes(link.path)
            ? "text-[#288AF9] bg-[#288AF91A]"
            : "text-grey bg-transparent"
        )}
      >

        {link.icon}
        {link.name}
      </Link>


      {/* Sub Tabs */}
      {
        pathname === link.path || pathname === link.subTab?.[0].path || pathname === link.subTab?.[1].path && link.subTab ?
          <ul className=" flex flex-col w-full gap-2 pl-10">
            {link.subTab?.map(subtabs => (
              <Link href={subtabs.path} key={subtabs} className={cn("p-4 border-none text-xs flex gap-2 rounded-xl",
                pathname === subtabs.path
                  ? "text-[#288AF9] bg-[#288AF91A]"
                  : "text-grey bg-transparent"
              )}>
                {subtabs.icon}{subtabs.name}
              </Link>
            ))}
          </ul>
          : ''
      }


    </>
  );
};

export default StyledLinks;
