'use client';
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import IndexForm from './multi-step-forms/IndexForm';
import ProfileDetailForm from "./multi-step-forms/ProfileDetailForm";
import OTPVerificationForm from "./multi-step-forms/OTPVerificationForm";



export default function Login() {
    const [currStep, setCurrStep] = useState(1);

    return (
        <>
            {/* Header */}
            <div className="px-10 py-5 shadow-[0_4px_6px_0_#3288ED1A] bg-transparent">
                <Link href={"/"}>
                    <Image
                        src={"/hues_logo_2.png"}
                        height={30}
                        width={100}
                        placeholder="blur"
                        alt="Logo"
                        blurDataURL="/hues_logo.png"
                    />
                </Link>
            </div>
            {/* Body */}
            <div className="h-[92vh] flex justify-center items-center">
                {/* Login Form - Step 1 */}
                {currStep === 1 && <IndexForm setCurrStep={setCurrStep} />}

                {/* Login Form - Step 2 - If logIn with Mobile - OTPVerificationForm*/}
                {currStep === 2 && <OTPVerificationForm setCurrStep={setCurrStep} />}

                {/* Login Form - Step 3 - Final Profile Details form */}
                {
                    currStep === 3 && <ProfileDetailForm setCurrStep={setCurrStep} />
                }

            </div>
        </>
    );
};