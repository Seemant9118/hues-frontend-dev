import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LocalStorageService } from "@/lib/utils";
import { Phone, CreditCard } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ProfileDetailForm({ params, isThirdPartyLogin }) {
  console.log(params);
  const router = useRouter();
  const query = useSearchParams();
  const login = (e) => {
    e.preventDefault();
    const redirectPath = query.get("redirect") || "/"; // Default to the homepage if no redirect path is provided
    toast.success("Login Successfull.");
    LocalStorageService.set("token", "123");
    router.push(redirectPath);
  };

  return (
    <form
      onSubmit={login}
      className="border border-[#E1E4ED] p-10 px-5 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md"
    >
      <h1 className="w-full text-2xl text-[#414656] font-bold text-center">
        Please Complete Your Profile
      </h1>
      <p className="w-full text-xl text-[#414656] text-center">
        One account for all things <span className="font-bold">Hues</span>
      </p>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="mobile-number" className="text-[#414656] font-medium">
          PAN Details <span className="text-red-600">*</span>
        </Label>
        <div className="relative">
          <Input
            required={true}
            className="focus:font-bold"
            type="text"
            placeholder="FGHJ1456T"
          />
          <CreditCard className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
        </div>
      </div>

      {isThirdPartyLogin && (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="mobile-number" className="text-[#414656] font-medium">
            Mobile Number  <span className="text-red-600">*</span>
          </Label>
          <div className="relative">
            <Input
              required={true}
              className="focus:font-bold"
              type="tel"
              placeholder="+91 987654321"
            />
            <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
        </div>
      )}
      {!isThirdPartyLogin && (
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="mobile-number" className="text-[#414656] font-medium">
            Aadhaar Number*
          </Label>
          <div className="relative">
            <Input
              required={true}
              className="focus:font-bold"
              type="text"
              placeholder="1111-1111-1111"
            />
            <Phone className="text-[#3F5575] absolute top-1/2 right-2 -translate-y-1/2" />
          </div>
        </div>
      )}

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="dob" className="text-[#414656] font-medium">
          Date of Birth <span className="text-red-600">*</span>
        </Label>
        <div className="border rounded-[6px] py-2 pl-2 pr-1 flex items-center gap-1">
          <input
            required={true}
            className="w-full border-none focus:outline-none focus:font-bold text-[#3F5575] text-sm"
            type="date"
            placeholder="28 / 06 / 2002"
          />
        </div>
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email" className="text-[#414656] font-medium">
          Email Address <span className="text-red-600">*</span>
        </Label>
        <div className="relative">
          <Input
            required={true}
            className="focus:font-bold"
            type="email"
            placeholder="patrick@gmail.com*"
          />
          <span className="text-[#3F5575] font-bold absolute top-1/2 right-2 -translate-y-1/2">
            @
          </span>
        </div>
      </div>
      <Button type="submit" className="w-full">
        Submit Details
      </Button>
    </form>
  );
};
