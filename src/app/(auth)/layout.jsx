import Image from "next/image";

export default function LoginLayout({ children }) {
  return (
    <>
      <div className="bg-[#287bd8]">
        <Image
          className="absolute z-10 w-full h-full"
          src={"/bg-login.png"}
          width={1000}
          height={1000}
          alt="bg-login"
        />
        {children}
      </div>
    </>
  );
}
