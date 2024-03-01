import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { Bell, UserCircle } from "lucide-react";

const Header = () => {
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
        <Button variant={"link"} size={"icon"}>
          <Bell className="text-[#A5ABBD]" />
        </Button>
        <Button variant={"link"} size={"icon"}>
          <UserCircle className="text-[#A5ABBD]" />
        </Button>
      </div>
    </div>
  );
};

export default Header;
