'use client';
import { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Phone } from 'lucide-react';


export default function IndexForm({ setCurrStep }) {

    const [loginWithThirdParty, setLoginWithThirdParty] = useState(true); // digilocker (thirdParty) by default active

    const handleChange = () => {
        setLoginWithThirdParty(!loginWithThirdParty);
    }


    return (
        <div className="border border-[#E1E4ED] p-10 flex flex-col justify-center items-center gap-5 h-[500px] w-[450px] bg-white z-20 rounded-md">
            <h1 className="w-full text-3xl text-[#414656] font-bold text-center">Welcome to HuesERP!</h1>
            <p className="w-full text-xl text-[#414656] text-center">One account for all things <span className="font-bold">Hues</span></p>
            {
                loginWithThirdParty ?
                    <>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="adhar-number" className="text-[#414656] font-medium">Adhar Number*</Label>
                            <div className="border-2 rounded py-2 px-4 hover:border-gray-600 flex items-center gap-1">
                                <input className="w-full  border-none focus:outline-none focus:font-bold" type="tel" placeholder="Adhar Number*" />
                                <span className="text-[#3F5575] font-bold">@</span>
                            </div>
                        </div>
                        <div className="w-full border-2 py-2 px-4 gap-1 rounded flex justify-center font-bold hover:border-[#5532E8] text-[#8f8f8f] hover:text-[#5532E8] hover:cursor-pointer grayscale hover:grayscale-0" onClick={() => setCurrStep(3)}>
                            <Image src={"/digi-icon.png"} width={25} height={20} />
                            <button>Login with Digilocker</button>
                        </div>
                    </>
                    :
                    <>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="mobile-number" className="text-[#414656] font-medium">Mobile Number*</Label>
                            <div className="border-2 rounded py-2 px-4 hover:border-gray-600 flex items-center gap-1">
                                <input className="w-full  border-none focus:outline-none focus:font-bold" type="tel" placeholder="+91 0987654321" />
                                <span className=" text-[#3F5575] font-bold"><Phone /></span>
                            </div>
                        </div>
                        <div className="w-full py-2 px-4 gap-1 rounded flex justify-center font-bold text-white hover:cursor-pointer bg-[#288AF9] hover:bg-[#3e7fc9]" onClick={() => setCurrStep(2)}>
                            <Image src={"/smartphone.png"} width={15} height={5} />
                            <button>Login with Mobile</button>
                        </div>
                    </>
            }

            {/* signup redirection */}
            <div className="w-full py-2 px-4 flex justify-center gap-1 font-bold text-[#414656]">Not a Hues subscriber yet? <span className="text-[#288AF9] hover:underline hover:cursor-pointer">Sign-Up</span></div>

            {/* log in with google redirection */}
            <div className="w-full py-2 px-4 gap-1 rounded flex justify-center font-bold text-[#414656] hover:cursor-pointer bg-[#f5f4f4] hover:bg-[#e8e7e7]">
                <Image src={"/google-icon.png"} width={25} height={20} />
                <button>Login with Google</button>
            </div>

            {/* button handler on the basis of current login method Digilocker/Mobile */}
            {
                loginWithThirdParty ?
                    <div className="w-full py-2 px-4 gap-1 rounded flex justify-center font-bold text-white hover:cursor-pointer bg-[#288AF9] hover:bg-[#3e7fc9]">
                        <Image src={"/smartphone.png"} width={15} height={5} />
                        <button onClick={handleChange}>Login with Mobile</button>
                    </div>
                    :
                    <div className="w-full border-2 py-2 px-4 gap-1 rounded flex justify-center font-bold hover:border-[#5532E8] text-[#8f8f8f] hover:text-[#5532E8] hover:cursor-pointer grayscale hover:grayscale-0">
                        <Image src={"/digi-icon.png"} width={25} height={20} />
                        <button onClick={handleChange}>Login with Digilocker</button>
                    </div>
            }
        </div>
    )
}