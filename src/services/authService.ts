import { api } from "../lib/api-client";
import { API_ENDPOINTS } from "./apiEndpoints";

export interface LoginCredentials {
  mobile: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface OtpRequest {
  identifier: string;
}

export interface OtpVerifyRequest {
  identifier: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  emailOrPhone: string;
}

export interface VerifyOtpRequest {
  otp: string;
  emailOrPhone: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResendOtpRequest {
  emailOrPhone: string;
}

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */
export const authService = {
  /**
   * Request OTP for authentication
   */
  async requestOtp(identifier: string): Promise<{ message: string }> {
    try {
      return await api.post(API_ENDPOINTS.AUTH.OTP_REQUEST, { identifier });
    } catch {
      throw new Error("Failed to request OTP. Please try again.");
    }
  },

  /**
   * Verify OTP and login
   */
  async verifyOtp(identifier: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, {
        identifier,
        otp,
      });

      // Store tokens
      if (response.accessToken) {
        localStorage.setItem("auth_token", response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem("refresh_token", response.refreshToken);
        }
      }

      return response;
    } catch {
      throw new Error("Invalid OTP. Please try again.");
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
    }
  },

  /**
   * Request password reset OTP
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    try {
      return await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    } catch {
      throw new Error("Failed to send OTP. Please try again.");
    }
  },

  /**
   * Reset password
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    try {
      return await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    } catch {
      throw new Error("Failed to reset password. Please try again.");
    }
  },

  /**
   * Resend OTP
   */
  async resendOtp(data: ResendOtpRequest): Promise<{ message: string }> {
    try {
      return await api.post(API_ENDPOINTS.AUTH.RESEND_OTP, data);
    } catch {
      throw new Error("Failed to resend OTP. Please try again.");
    }
  },

  /**
   * Get current user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("auth_token");
  },

  /**
   * Get auth token
   */
  getToken(): string | null {
    return localStorage.getItem("auth_token");
  },

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token");
  },

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken,
      });

      if (response.accessToken) {
        localStorage.setItem("auth_token", response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem("refresh_token", response.refreshToken);
        }
        return response.accessToken;
      }
      throw new Error("Refresh failed");
    } catch (error) {
      this.logout();
      throw error;
    }
  },
};
