import Image from 'next/image';

export default function LoginLayout({ children }) {
  return (
    <>
      <div className="fixed inset-0 flex">
        <div className="w-1/2 bg-white">{children}</div>
        <div className="relative w-1/2 pl-24 pt-20">
          <Image
            src="/posterImageLogin.png"
            alt="bg-login"
            width={677.93}
            height={706}
            className="object-fit -rotate-6 rounded-md border p-2 shadow-[0_4px_6px_0_#3288ED1A]" // Added object-cover class
          />
        </div>
      </div>
    </>
  );
}
