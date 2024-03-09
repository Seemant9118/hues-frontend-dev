
import { cn } from "@/lib/utils";
import Image from "next/image";


const DashCard = ({ title, numbers, growth }) => {
    return (
        <div className="border w-56 h-28 p-5 flex flex-col shadow-md rounded-md bg-white hover:cursor-pointer hover:shadow-lg">
            <div className="flex gap-1 items-center justify-between">
                <div className=" text-[#93A3AB]">{title}</div>
                <Image src={'/dotmenu.png'} alt="dot-menu" width={20} height={20} />
            </div>
            <div className="flex gap-1 justify-between items-center">
                <div className="text-3xl font-semibold py-1 ">{numbers}</div>
                {
                    growth !== '' && (
                        <div className={cn(growth[0] == '+' ? "bg-[#E3F4E3] text-[#1EC57F]" : "bg-[#F4E3E3] text-[#E85555] ", "rounded-full py-1 px-2 text-sm font-semibold")}>{growth}</div>
                    )
                }
            </div>

        </div>
    );
};

export default DashCard;