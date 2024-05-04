import { LocalStorageService } from "@/lib/utils";
import axios from "axios";

export const APIinstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL
});


// axios interceptor
APIinstance.interceptors.request.use(
    (request) => {
        const token = LocalStorageService.get("token");
        if(token) {
            request.headers.Authorization = "Bearer " + token;
        }
        return request;
    },
    (error) => {
        return Promise.reject(error);
    }
);
APIinstance.interceptors.response.use(
    (response) => {
        if(response.status === 401 || response.status === 403) {
            window.location.href = "/login";
        }
        return response;
    },
    (error) => {
        return Promise.reject(error);
    }
);

