import { apiService } from './api';
import { LoginRequest, LoginResponse } from '../types/api';

const TOKEN_KEY = 'dishub_token';
const USER_KEY = 'dishub_user';

class AuthService {
  // Login user and store token
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>('/auth/login', {
        username,
        password,
      });

      if (response.success && response.data.token) {
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      }

      return response;
    } catch (error) {
      // Error is already handled by apiService with toast notification
      throw error;
    }
  }

  // Logout user and clear stored data
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      // Check if token is expired (basic JWT validation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        this.logout(); // Token expired, logout user
        return false;
      }

      return true;
    } catch (error) {
      // Invalid token format
      this.logout();
      return false;
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  // Set token in localStorage
  private setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  // Get stored user data
  getUser(): any {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  // Set user data in localStorage
  private setUser(user: any): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // Get current authenticated user
  getCurrentUser(): any {
    if (!this.isAuthenticated()) {
      return null;
    }
    return this.getUser();
  }

  // Check if user has specific role
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Refresh token if needed (optional enhancement)
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiService.post<{ token: string }>('/auth/refresh');

      if (response.data?.token) {
        this.setToken(response.data.token);
        return true;
      }

      return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Initialize authentication check
  initAuth(): boolean {
    if (!this.isAuthenticated()) {
      this.logout();
      return false;
    }
    return true;
  }
}

// Create singleton instance
export const authService = new AuthService();