import { cn } from '@/lib/utils';
import Link from 'next/link';

const DashCard = ({ title, numbers, growth, icon }) => {
  return (
    <div className="flex h-28 w-56 flex-col rounded-md border bg-white p-5 shadow-md hover:cursor-pointer hover:shadow-lg">
      <div className="flex items-center justify-between gap-1">
        <div className="text-[#93A3AB]">{title}</div>
        {/* <Image src={'/dotmenu.png'} alt="dot-menu" width={20} height={20} /> */}
      </div>
      <div className="flex items-center justify-between gap-1">
        <div className="py-1 text-3xl font-semibold">{numbers}</div>
        {growth !== '' && (
          <div
            className={cn(
              growth[0] === '+'
                ? 'bg-[#E3F4E3] text-[#1EC57F]'
                : 'bg-[#F4E3E3] text-[#E85555]',
              'rounded-full px-2 py-1 text-sm font-semibold',
            )}
          >
            {growth}
          </div>
        )}
      </div>
      <div className="flex justify-end pb-2 text-blue-500">
        <Link href="/insights">{icon}</Link>
      </div>
    </div>
  );
};

export default DashCard;
