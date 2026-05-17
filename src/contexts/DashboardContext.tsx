import { createContext, useContext, useState, type ReactNode } from "react";
import {
  dashboardService,
  type DashboardStats,
  type AttendanceData,
  type RecentActivity,
} from "../services/dashboardService";

interface DashboardContextType {
  stats: DashboardStats | null;
  attendanceData: AttendanceData[];
  recentActivities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchAttendanceData: (period?: "week" | "month" | "year") => Promise<void>;
  fetchRecentActivities: (limit?: number) => Promise<void>;
  clearError: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getStats();
      setStats(data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    }
  };

  const fetchAttendanceData = async (period: "week" | "month" | "year" = "week") => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getAttendanceData(period);
      setAttendanceData(data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to fetch attendance data");
    }
  };

  const fetchRecentActivities = async (limit: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getRecentActivities(limit);
      setRecentActivities(data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : "Failed to fetch recent activities");
    }
  };

  const clearError = () => setError(null);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        attendanceData,
        recentActivities,
        isLoading,
        error,
        fetchStats,
        fetchAttendanceData,
        fetchRecentActivities,
        clearError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};
