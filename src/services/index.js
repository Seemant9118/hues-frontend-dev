import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { parseJwt } from '@/appUtils/helperFunctions';
import {
  adminRefreshToken,
  refreshToken,
} from './Token_Services/TokenServices';

export const APIinstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

// ── Refresh-token queue & retry config ──────────────────────────────
const MAX_RETRY_COUNT = 3; // retry a failed request at most 3 times
let isRefreshing = false; // true while a refresh call is in-flight
let failedQueue = []; // requests waiting for the refresh to finish

const forceLogout = () => {
  isRefreshing = false;
  failedQueue = [];
  toast.error('Session expired. Please log in again.');
  LocalStorageService.clear();
  SessionStorageService.clear();
  window.location.href = '/';
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
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

// Response interceptor
APIinstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const statusCode = error?.response?.status;

    // Only handle 401 / 403
    if (statusCode !== 401 && statusCode !== 403) {
      return Promise.reject(error);
    }

    // Retry-count guard
    // Track how many times we've retried this specific request.
    originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

    if (originalRequest._retryCount > MAX_RETRY_COUNT) {
      // Exhausted retries → force logout
      forceLogout();
      return Promise.reject(error);
    }

    // No refresh token → logout immediately
    const refreshTokenValue = LocalStorageService.get('refreshtoken');
    if (!refreshTokenValue) {
      forceLogout();
      return Promise.reject(error);
    }

    // If a refresh is already in-flight, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return APIinstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Start a fresh refresh
    isRefreshing = true;

    try {
      const payload = parseJwt(refreshTokenValue);
      const isAdmin = payload?.isAdmin || false;

      const refreshTokenData = await (isAdmin
        ? adminRefreshToken()
        : refreshToken());

      const newAccessToken = refreshTokenData?.data?.data?.access_token;

      if (!newAccessToken) {
        // Refresh succeeded but returned no token → treat as failure
        processQueue(new Error('No access token returned'), null);
        forceLogout();
        return Promise.reject(error);
      }

      // Persist the new token
      LocalStorageService.set('token', newAccessToken);
      isRefreshing = false;

      // Resolve all queued requests with the new token
      processQueue(null, newAccessToken);

      // Retry the original request
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return APIinstance(originalRequest);
    } catch (refreshError) {
      // Refresh call itself failed → reject queue & force logout
      isRefreshing = false;
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    }
  },
);
