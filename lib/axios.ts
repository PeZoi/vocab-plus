import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { createClient } from '@/lib/supabase/client';

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Supabase Access Token khi chạy ở client
apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    } catch {
      // Nếu lỗi session thì bỏ qua, để backend trả về 401
    }
  }
  return config;
});

// Response Interceptor: Chuẩn hóa dữ liệu trả về và bóc tách error message
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Đã xảy ra lỗi khi kết nối máy chủ!';
    return Promise.reject(new Error(message));
  }
);
