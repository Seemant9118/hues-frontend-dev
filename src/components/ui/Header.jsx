"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { Bell, UserCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocalStorageService } from "@/lib/utils";

const Header = () => {
  const router = useRouter();
  const isOnboardingComplete = LocalStorageService.get("isOnboardingComplete");

  const logout = () => {
    LocalStorageService.clear();
    router.push("/login");
  };
  const login = () => {
    router.push("/login");
  };

  return (
    <div className="px-10 py-5 shadow-[0_4px_6px_0_#3288ED1A] flex items-center justify-between bg-white">
      <Link href={"/"}>
        <Image
          src={"/hues_logo.png"}
          height={30}
          width={100}
          placeholder="blur"
          alt="Logo"
          blurDataURL="/hues_logo.png"
        />
      </Link>
      <div className="flex items-center gap-4">
        {/* <Button variant={"link"} size={"icon"} className="your-notification">
          <Bell className="text-grey" />
        </Button> */}

        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"link"} size={"icon"} className="your-profile">
              <UserCircle className="text-grey" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="max-w-[180px] p-1 m-2 flex flex-col gap-1">
            {!isOnboardingComplete && (
              <Button onClick={login} className="w-full" variant="outline">
                Complete Onboarding
              </Button>
            )}
            <Button onClick={logout} className="w-full" variant="outline">
              Logout
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default Header;
