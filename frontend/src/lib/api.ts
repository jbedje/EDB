import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { handleApiError } from './errorHandler';

// Track if we're currently refreshing the token to avoid multiple requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add request timestamp for performance monitoring
    (config as any).metadata = { startTime: new Date() };

    return config;
  },
  (error: AxiosError) => {
    if (import.meta.env.DEV) {
      console.error('Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log performance in development
    if (import.meta.env.DEV) {
      const config = response.config as any;
      if (config.metadata) {
        const duration = new Date().getTime() - config.metadata.startTime.getTime();
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url} - ${duration}ms`);
      }
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle network errors
    if (!error.response) {
      handleApiError(error);
      return Promise.reject(error);
    }

    // Handle 401 - Unauthorized (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken } = response.data.data;

        // Update store with new token
        useAuthStore.getState().login(
          useAuthStore.getState().user!,
          newAccessToken,
          refreshToken
        );

        // Update failed queue
        processQueue(null, newAccessToken);

        // Retry original request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);

        // Logout user and redirect to login
        useAuthStore.getState().logout();
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors with centralized error handler
    // Don't show toast for certain silent endpoints
    const silentEndpoints = ['/auth/refresh', '/auth/validate'];
    const shouldShowError = !silentEndpoints.some((endpoint) =>
      originalRequest.url?.includes(endpoint)
    );

    if (shouldShowError) {
      handleApiError(error);
    }

    return Promise.reject(error);
  }
);

export default api;
