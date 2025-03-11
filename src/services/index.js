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
  async (response) => response, // Directly return the response

  async (error) => {
    const statusCode = error?.response?.status;
    const refreshTokenValue = LocalStorageService.get('refreshtoken');

    if (statusCode === 401 || statusCode === 403) {
      // If no refresh token, clear storage and redirect to login
      if (!refreshTokenValue) {
        LocalStorageService.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const refreshTokenData = await refreshToken();
        const newAccessToken = refreshTokenData?.data?.data?.access_token;

        if (newAccessToken) {
          LocalStorageService.set('token', newAccessToken);
          // Retry the failed request with the new token
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return APIinstance(error.config);
        }
      } catch (refreshError) {
        toast.error('Session expired. Please log in again.');
        LocalStorageService.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
