import Image from 'next/image';

export default function LoginLayout({ children }) {
  return (
    <>
      <div className="fixed inset-0 bg-[#287bd8]">
        <Image
          className="absolute z-10 object-cover"
          src={'/bg-login.png'}
          alt="bg-login"
          layout="fill"
        />
        {children}
      </div>
    </>
  );
}
