export const user_Auth = {
    // 1. generate OTP 
    loginGenerateOtp: {
        endpoint: `/api/v1/iam/auth/login/mobile/generate_otp`,
        endpointKey: "login_generate_otp"
    },
    // 2. verify OTP
    loginVerifyOtp : {
        endpoint: `/api/v1/iam/auth/login/mobile/verify_otp`,
        endpointKey: "login_verify_otp"
    },
    //  3. Update User
    updateUser : {
        endpoint:  `/api/v1/iam/user/update`,
        endpointKey: "update_user_data"
    },
    // 4. create KYC
    createKYC : {
        endpoint:`/api/v1/iam/kyc/createrequest`,
        endpointKey:"create_user_kyc"
    },
    // 5. CheckStatus isKyc
    statucKYC : {
        endpoint:`/api/v1/iam/kyc/checkstatus`,
        endpointKey:"status_kyc"
    },
    // 6. update KYC
    updateKYC : {
        endpoint:`/api/v1/iam/kyc/updateKyc`,
        endpointKey:"update_kyc"
    }
};
