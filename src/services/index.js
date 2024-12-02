import { LocalStorageService } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { refreshToken } from './Token_Services/TokenServices';

export const APIinstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

// axios interceptor
APIinstance.interceptors.request.use(
  (request) => {
    const token = LocalStorageService.get('token');
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  },
);

APIinstance.interceptors.response.use(
  async (response) => {
    return response;
  },

  async (error) => {
    const refreshTokenValue = LocalStorageService.get('refreshtoken');
    // Handle errors
    if (
      !refreshTokenValue &&
      (error?.response?.data?.statusCode === 401 ||
        error?.response?.data?.statusCode === 403)
    ) {
      LocalStorageService.clear();
      window.location.href = '/login';
    }
    // Refresh token logic when status is 401 or 403
    if (
      refreshTokenValue &&
      (error?.response?.data?.statusCode === 401 ||
        error?.response?.data?.statusCode === 403)
    ) {
      try {
        // Fetch new token
        const refreshTokenData = await refreshToken(); // api call we can pass refreshToken not access_token
        const newAccessToken = refreshTokenData?.data?.data?.access_token;

        if (newAccessToken) {
          LocalStorageService.set('token', newAccessToken); // Save new access token
        }
      } catch (error) {
        toast.error('Session expired. Please log in again.');
        LocalStorageService.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
