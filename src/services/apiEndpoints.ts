/**
 * Centralized API Endpoints
 * All backend URL strings are defined here to ensure consistency and ease of maintenance.
 */

export const API_ENDPOINTS = {
  AUTH: {
    OTP_REQUEST: "/auth/otp/request",
    OTP_VERIFY: "/auth/otp/verify",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    RESEND_OTP: "/auth/resend-otp",
    REFRESH: "/auth/refresh",
  },
  USERS: {
    BASE: "/users",
    ROLES: "/users/roles",
    BY_ID: (id: string) => `/users/${id}`,
    ASSIGN_ROLE: (userId: string) => `/users/${userId}/assign-role`,
    STATUS: (userId: string) => `/users/${userId}/status`,
  },
  DASHBOARD: {
    STATS: "/dashboard/stats",
    ATTENDANCE: (period: string) => `/dashboard/attendance?period=${period}`,
    ACTIVITIES: (limit: number) => `/dashboard/activities?limit=${limit}`,
    FEES_SUMMARY: "/dashboard/fees-summary",
  },
  BRANCHES: {
    BASE: "/branches",
    BY_ID: (id: string) => `/branches/${id}`,
    BY_ORG: (orgId: string) => `/branches/organization/${orgId}`,
    STATUS: (id: string) => `/branches/${id}/status`,
  },
};
