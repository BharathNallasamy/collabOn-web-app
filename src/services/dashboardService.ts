import { api } from "../lib/api-client";
import { API_ENDPOINTS } from "./apiEndpoints";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendance: {
    present: number;
    absent: number;
    late: number;
  };
  fees: {
    collected: number;
    pending: number;
    overdue: number;
  };
}

export interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
}

export interface RecentActivity {
  id: string;
  type: "attendance" | "fees" | "announcement" | "other";
  message: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */
export const dashboardService = {
  /**
   * Get dashboard overview statistics
   */
  async getStats(): Promise<DashboardStats> {
    try {
      return await api.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS);
    } catch {
      throw new Error("Failed to fetch dashboard statistics.");
    }
  },

  /**
   * Get attendance data for chart
   */
  async getAttendanceData(period: "week" | "month" | "year" = "week"): Promise<AttendanceData[]> {
    try {
      return await api.get<AttendanceData[]>(API_ENDPOINTS.DASHBOARD.ATTENDANCE(period));
    } catch {
      throw new Error("Failed to fetch attendance data.");
    }
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      return await api.get<RecentActivity[]>(API_ENDPOINTS.DASHBOARD.ACTIVITIES(limit));
    } catch {
      throw new Error("Failed to fetch recent activities.");
    }
  },

  /**
   * Get fee collection summary
   */
  async getFeesSummary(): Promise<{
    totalCollected: number;
    totalPending: number;
    monthlyTrend: Array<{ month: string; collected: number; pending: number }>;
  }> {
    try {
      return await api.get(API_ENDPOINTS.DASHBOARD.FEES_SUMMARY);
    } catch {
      throw new Error("Failed to fetch fees summary.");
    }
  },
};
