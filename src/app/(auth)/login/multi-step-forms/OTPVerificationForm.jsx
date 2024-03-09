'use client';
import { Clock5 } from 'lucide-react';
import { OTPInput } from 'input-otp';
import { cn } from '@/lib/utils';


function Slot(props) {
    return (
        <div
            className={cn(
                'relative w-10 h-14 text-[2rem]',
                'flex items-center justify-center',
                'transition-all duration-300',
                'border-2 rounded-md bg-[#A5ABBD1A] focus:bg-blue-600',
                'group-hover:border-accent-foreground/20 group-focus-within:border-accent-foreground/20',
                'outline outline-0 outline-accent-foreground/20',
                { 'outline-4 outline-accent-foreground': props.isActive },
            )}
        >
            {props.char !== null && <div className='text-[#288AF9]'>{props.char}</div>}
        </div>
    );
};

export default function OTPVerificationForm({ setCurrStep }) {
    return (
        <div className="border border-[#E1E4ED] p-10 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md">
            <h1 className="w-full text-3xl text-[#414656] font-bold text-center">Welcome to HuesERP!</h1>
            <p className="w-full text-xl text-[#414656] text-center">One account for all things <span className="font-bold">Hues</span></p>
            <h2 className="w-full font-bold text-2xl">Verify OTP</h2>
            <p className="w-full text-sm">A one time password has been sent to <span className="text-[#414656] font-bold">+91 9876 54310</span></p>

            <OTPInput
                maxLength={4}
                containerClassName="group flex items-center has-[:disabled]:opacity-30"
                render={({ slots }) => (
                    <div className="flex gap-4 ">
                        {slots.map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                        ))}
                    </div>
                )}
            />

            <p className="w-full text-sm text-[#A5ABBD] flex items-center gap-2">Waiting for resend OTP <span className="font-semibold flex items-center gap-1"><Clock5 size={15} />00:54</span></p>

            <div className="w-full py-2 px-4 gap-1 rounded-md flex justify-center font-bold text-white hover:cursor-pointer bg-gradient-to-b  from-[#288af9] to-[#1863b7]" onClick={() => setCurrStep(3)}>
                Submit
            </div>
        </div>
    );
};