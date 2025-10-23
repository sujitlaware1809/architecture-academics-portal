// Authentication configuration and utilities
import { api } from './api';

// Define User type locally to match api.ts
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | { value: string; };
  is_active: boolean;
  created_at: string;
  profile?: {
    phone?: string;
    bio?: string;
    location?: string;
    website?: string;
    skills?: string[];
    education?: string;
    experience?: string;
  };
}

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || '.architectureacademics.com';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const auth = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  // Login user
  async login(credentials: { email: string; password: string }): Promise<any> {
    try {
      const response = await api.login(credentials);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  async logout(): Promise<void> {
    api.logout();
    window.dispatchEvent(new Event('auth-change'));
  },

  // Get current user
  async getCurrentUser(): Promise<any | null> {
    try {
      const response = await api.getCurrentUser();
      if (response.error) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Get stored token
  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  },

  // Get stored user
  getStoredUser(): any | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Attach auth headers to requests
  getAuthHeaders(): HeadersInit {
    const token = this.getStoredToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
};