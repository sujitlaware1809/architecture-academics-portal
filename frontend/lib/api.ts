const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// API Response types
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | { value: string; };  // Handle both string and enum object
  is_active: boolean;
  created_at: string;
  profile?: UserProfile;
}

interface UserProfile {
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  education?: string;
  experience?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  userType?: string;
  college?: string;
  year?: string;
  degree?: string;
  experience?: string;
  cao_number?: string;
  company?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  venue: string;
  category: string;
  organizer: string;
  contact: string;
  website: string;
  ticketPrice: string;
  ticketUrl: string;
  featuredImage: string | null;
  status: string;
}

// API Functions
export const api = {
  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Important for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle FastAPI validation errors
        if (response.status === 422 && data.detail && Array.isArray(data.detail)) {
          const errorMessages = data.detail.map((err: any) => 
            `${err.loc?.join(' → ') || 'Field'}: ${err.msg}`
          ).join(', ');
          return { error: errorMessages };
        }
        return { error: data.detail || data.message || 'Login failed' };
      }

      // Store token in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return { data };
    } catch (error) {
      console.error('Login error:', error);
      // More descriptive error message
      if (!navigator.onLine) {
        return { error: 'No internet connection. Please check your network.' };
      }
      return { error: 'Unable to connect to the server. Please make sure the backend server is running at http://127.0.0.1:8000' };
    }
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle FastAPI validation errors
        if (response.status === 422 && data.detail && Array.isArray(data.detail)) {
          const errorMessages = data.detail.map((err: any) => 
            `${err.loc?.join(' → ') || 'Field'}: ${err.msg}`
          ).join(', ');
          return { error: errorMessages };
        }
        return { error: data.detail || data.message || 'Registration failed' };
      }

      return { data, message: 'Registration successful! Please login.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  // User Profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return { error: 'No authentication token found' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
          }
        }
        return { error: data.detail || 'Failed to fetch user data' };
      }

      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data));
      }

      return { data };
    } catch (error) {
      console.error('Get current user error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<User>> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return { error: 'No authentication token found' };
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Failed to update profile' };
      }

      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(data));
      }

      return { data, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  // Job applications
  async applyForJob(jobId: number, applicationData: { cover_letter?: string; resume_url?: string }): Promise<ApiResponse<any>> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return { error: 'Authentication required' };
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(applicationData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Failed to submit application' };
      }

      return { data, message: 'Application submitted successfully!' };
    } catch (error) {
      console.error('Apply for job error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async getMyApplications(): Promise<ApiResponse<any[]>> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return { error: 'Authentication required' };
      }

      const response = await fetch(`${API_BASE_URL}/applications/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Failed to fetch applications' };
      }

      return { data };
    } catch (error) {
      console.error('Get applications error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async saveJob(jobId: number): Promise<ApiResponse<any>> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return { error: 'Authentication required' };
      }

      const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Failed to save job' };
      }

      return { data, message: 'Job saved successfully!' };
    } catch (error) {
      console.error('Save job error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  async getSavedJobs(): Promise<ApiResponse<any[]>> {
    try {
      const token = this.getStoredToken();
      if (!token) {
        return { error: 'Authentication required' };
      }

      const response = await fetch(`${API_BASE_URL}/jobs/saved/my`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.detail || 'Failed to fetch saved jobs' };
      }

      return { data };
    } catch (error) {
      console.error('Get saved jobs error:', error);
      return { error: 'Network error. Please try again.' };
    }
  },

  // Generic HTTP methods
  async get(endpoint: string, options: {params?: any} = {}): Promise<any> {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      
      if (options.params) {
        Object.keys(options.params).forEach(key => {
          if (options.params[key] !== undefined && options.params[key] !== null) {
            url.searchParams.append(key, options.params[key]);
          }
        });
      }

      const token = this.getStoredToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { detail: 'Invalid response from server' };
      }

      if (!response.ok) {
        const error: any = new Error(data.detail || 'Request failed');
        error.response = {
          status: response.status,
          data: data
        };
        throw error;
      }

      return { data };
    } catch (error: any) {
      // Handle network errors (backend not accessible)
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        console.warn('⚠️ Backend connection failed. Is the server running on port 8000?');
        const networkError: any = new Error('Backend server not accessible');
        networkError.response = { status: 0, data: { detail: 'Network error' } };
        throw networkError;
      }
      
      // Don't log 404 errors as they're expected for "not enrolled" checks
      if (error?.response?.status !== 404) {
        console.error('GET request error:', error);
      }
      throw error;
    }
  },

  async post(endpoint: string, body: any): Promise<any> {
    try {
      const token = this.getStoredToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: any = new Error(data.detail || 'Request failed');
        error.response = { status: response.status, data };
        throw error;
      }

      return { data };
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  },

  async put(endpoint: string, body: any): Promise<any> {
    try {
      const token = this.getStoredToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return { data };
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  },

  async delete(endpoint: string): Promise<any> {
    try {
      const token = this.getStoredToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Request failed');
      }

      return { data };
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  },

  // Utility functions
  getStoredUser(): User | null {
    if (typeof window === 'undefined') return null; // Server-side check
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  getStoredToken(): string | null {
    if (typeof window === 'undefined') return null; // Server-side check
    return localStorage.getItem('access_token');
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false; // Server-side check
    return !!this.getStoredToken();
  },
};

export default api;

// Events API
export const getEventById = async (id: string): Promise<Event> => {
  // This is a mock implementation until backend is ready
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock data
  return {
    id,
    title: "International Architecture Symposium",
    description: "Join us for a day of inspiring talks and networking with leading architects from around the world. The symposium will cover sustainable design, urban planning, and the future of architecture.",
    date: "2025-10-15",
    startTime: "09:00",
    endTime: "17:00",
    location: "Mumbai",
    venue: "Grand Convention Center",
    category: "Conference",
    organizer: "Architecture Association of India",
    contact: "info@archsymposium.com",
    website: "https://archsymposium.com",
    ticketPrice: "₹2,500",
    ticketUrl: "https://tickets.archsymposium.com",
    featuredImage: null,
    status: "published"
  }
}
