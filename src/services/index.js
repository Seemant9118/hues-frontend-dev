import { LocalStorageService } from '@/lib/utils';
import axios from 'axios';

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
  (response) => {
    if (
      response?.data?.data?.statusCode === 401 ||
      response?.data?.data?.statusCode === 403
    ) {
      window.location.href = '/login';
    }
    return response;
  },
  (error) => {
    if (
      error?.response?.data?.statusCode === 401 ||
      error?.response?.data?.statusCode === 403
    ) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
