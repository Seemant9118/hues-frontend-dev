export const enterprise_user = {
    // 1. post enterprise user data
    createEnterpriseUser: {
        endpoint: `/api/v1/enterprise/user/create`,
        endpointKey: "create_enterprise_user"
    },
    // 2. get all enterprise users as a list
    getEnterpriseUsers: {
        endpoint: `/api/v1/enterprise/user/getenterpriseusers`,
        endpointKey: "get_enterprise_users"
    },
    // 3. get specific enterprise user through id
    getEnterpriseUser: {
        endpoint: `/api/v1/enterprise/user/get/`,
        endpointKey: "get_enterprise_user"
    },
    // 4. edit specific enterprise user through id
    updateEnterpriseUser: {
        endpoint: `/api/v1/enterprise/user/update/`,
        endpointKey: "update_enterprise_user"
    },
    // 5. delete specific enterprise user through id
    deleteEnterpriseUser: {
        endpoint: `/api/v1/enterprise/user/delete/`,
        endpointKey: "delete_enterprise_user"
    }
};
