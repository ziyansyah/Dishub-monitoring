import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api';
import { DashboardStats, RecentScan, WeeklyTrend, TaxStatusData } from '../types/api';

// API functions
const getDashboardStats = async (): Promise<DashboardStats> => {
  return apiService.get<DashboardStats>('/dashboard/stats');
};

const getRecentScans = async (limit: number = 5): Promise<RecentScan[]> => {
  return apiService.get<RecentScan[]>('/dashboard/recent-scans', { limit });
};

const getWeeklyTrend = async (): Promise<WeeklyTrend[]> => {
  return apiService.get<WeeklyTrend[]>('/dashboard/trend', { period: 'week' });
};

const getTaxStatusStats = async (): Promise<TaxStatusData[]> => {
  return apiService.get<TaxStatusData[]>('/dashboard/tax-status');
};

// TanStack Query hooks with real-time updates
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 25000, // 25 seconds - slightly less than refresh interval
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      // Retry strategy for dashboard stats
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403) return false;
        if (statusCode >= 500) return failureCount < 3; // Retry server errors up to 3 times
      }
      return failureCount < 2;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false, // Only refresh when tab is active
    refetchOnWindowFocus: true, // Refresh when window gains focus
  });
};

export const useRecentScans = (limit: number = 5) => {
  return useQuery({
    queryKey: ['recent-scans', limit],
    queryFn: () => getRecentScans(limit),
    staleTime: 20000, // 20 seconds - fresher for recent activity
    gcTime: 180000, // 3 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403) return false;
      }
      return failureCount < 2;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

export const useWeeklyTrend = () => {
  return useQuery({
    queryKey: ['weekly-trend'],
    queryFn: getWeeklyTrend,
    staleTime: 60000, // 1 minute for trend data
    gcTime: 600000, // 10 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403) return false;
      }
      return failureCount < 2;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

export const useTaxStatusStats = () => {
  return useQuery({
    queryKey: ['tax-status-stats'],
    queryFn: getTaxStatusStats,
    staleTime: 45000, // 45 seconds for tax status
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403) return false;
      }
      return failureCount < 2;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

// Hook for getting all dashboard data at once (for loading states)
export const useDashboardData = (recentScansLimit: number = 5) => {
  const stats = useDashboardStats();
  const recentScans = useRecentScans(recentScansLimit);
  const weeklyTrend = useWeeklyTrend();
  const taxStatus = useTaxStatusStats();

  return {
    stats,
    recentScans,
    weeklyTrend,
    taxStatus,
    isLoading: stats.isLoading || recentScans.isLoading || weeklyTrend.isLoading || taxStatus.isLoading,
    isError: stats.isError || recentScans.isError || weeklyTrend.isError || taxStatus.isError,
    error: stats.error || recentScans.error || weeklyTrend.error || taxStatus.error,
    lastUpdated: Math.max(
      stats.dataUpdatedAt || 0,
      recentScans.dataUpdatedAt || 0,
      weeklyTrend.dataUpdatedAt || 0,
      taxStatus.dataUpdatedAt || 0
    ),
  };
};

// Hook for manual refresh
export const useRefreshDashboard = () => {
  const queryClient = useQueryClient();

  return {
    refreshAll: () => {
      queryClient?.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient?.invalidateQueries({ queryKey: ['recent-scans'] });
      queryClient?.invalidateQueries({ queryKey: ['weekly-trend'] });
      queryClient?.invalidateQueries({ queryKey: ['tax-status-stats'] });
    },
    refreshStats: () => {
      queryClient?.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    refreshRecentScans: () => {
      queryClient?.invalidateQueries({ queryKey: ['recent-scans'] });
    },
  };
};