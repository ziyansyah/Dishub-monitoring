import { toast } from 'sonner';
import { API_BASE_URL, API_TIMEOUT } from '../config/api';
import { ApiError } from '../types/api';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = API_TIMEOUT;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      let errorMessage = 'An error occurred';

      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
      } else {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      // Handle specific error cases
      if (response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        this.handleUnauthorized();
      } else if (response.status === 403) {
        errorMessage = 'Access denied. Insufficient permissions.';
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (response.status === 429) {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }

      // Show individual toast notification
      toast.error(errorMessage);

      throw new ApiError(errorMessage, response.status);
    }

    // Handle successful responses
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return (await response.text()) as unknown as T;
  }

  private handleUnauthorized(): void {
    // Clear token and redirect to login
    localStorage.removeItem('dishub_token');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast.error('Request timeout. Please check your connection and try again.');
          throw new ApiError('Request timeout', 408);
        }

        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          toast.error('Network error. Please check your connection and try again.');
          throw new ApiError('Network error', 0);
        }
      }

      toast.error('An unexpected error occurred. Please try again.');
      throw new ApiError('Unexpected error', 0);
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('dishub_token');
    if (token) {
      return {
        Authorization: `Bearer ${token}`,
      };
    }
    return {};
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await this.fetchWithTimeout(url.toString(), {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    return this.handleResponse<T>(response);
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    return this.handleResponse<T>(response);
  }

  // File download
  async downloadFile(endpoint: string, filename: string): Promise<void> {
    try {
      const url = new URL(`${this.baseURL}${endpoint}`);
      const response = await this.fetchWithTimeout(url.toString(), {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new ApiError(`Download failed: ${response.statusText}`, response.status);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`File "${filename}" downloaded successfully`);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      toast.error('Failed to download file');
      throw new ApiError('Download failed');
    }
  }
}

// Create singleton instance
export const apiService = new ApiService();
export { ApiError };