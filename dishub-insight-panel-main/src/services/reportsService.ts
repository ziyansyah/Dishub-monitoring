import { useQuery } from '@tanstack/react-query';
import { apiService } from './api';
import { ScanHistoryParams, ScanHistoryResponse, ScanHistoryItem } from '../types/api';

// API functions
const getScanHistory = async (params: ScanHistoryParams): Promise<ScanHistoryResponse> => {
  return apiService.get<ScanHistoryResponse>('/reports/scan-history', params);
};

const exportReport = async (type: string, params: ScanHistoryParams): Promise<void> => {
  const queryParams = new URLSearchParams();
  queryParams.append('type', type);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const format = type === 'excel' ? 'xlsx' : 'pdf';
  const filename = `report-${type}-${new Date().toISOString().split('T')[0]}.${format}`;

  await apiService.downloadFile(`/reports/export?${queryParams.toString()}`, filename);
};

// TanStack Query hooks
export const useScanHistory = (params: ScanHistoryParams = {}) => {
  return useQuery({
    queryKey: ['scan-history', params],
    queryFn: () => getScanHistory(params),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403 || statusCode === 404) return false;
      }
      return failureCount < 2;
    },
    refetchInterval: 60000, // Auto-refresh every 1 minute for history data
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
};

// Export functions hook
export const useReportExport = () => {
  return {
    exportPDF: async (params: ScanHistoryParams = {}) => {
      await exportReport('pdf', params);
    },
    exportExcel: async (params: ScanHistoryParams = {}) => {
      await exportReport('excel', params);
    },
    exportDailyReport: async (date: string) => {
      await exportReport('daily', { startDate: date, endDate: date });
    },
    exportWeeklyReport: async (startDate: string, endDate: string) => {
      await exportReport('weekly', { startDate, endDate });
    },
    exportMonthlyReport: async (year: number, month: number) => {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      await exportReport('monthly', { startDate, endDate });
    },
  };
};

// Hook for getting filtered scan history
export const useFilteredScanHistory = (
  filters: {
    dateRange?: { start: string; end: string };
    officer?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const params: ScanHistoryParams = {
    ...filters,
    startDate: filters.dateRange?.start,
    endDate: filters.dateRange?.end,
    page: filters.page || 1,
    limit: filters.limit || 10,
  };

  return useScanHistory(params);
};

// Utility functions for report processing
export const processScanHistoryData = (
  scans: ScanHistoryItem[]
): {
  totalScans: number;
  uniqueVehicles: string[];
  officerStats: Record<string, number>;
  statusBreakdown: Record<string, number>;
  dailyStats: Record<string, number>;
} => {
  const uniqueVehicles = new Set(scans.map(scan => scan.plateNumber));
  const officerStats: Record<string, number> = {};
  const statusBreakdown: Record<string, number> = {};
  const dailyStats: Record<string, number> = {};

  scans.forEach(scan => {
    // Officer statistics
    officerStats[scan.officer] = (officerStats[scan.officer] || 0) + 1;

    // Status breakdown
    statusBreakdown[scan.status] = (statusBreakdown[scan.status] || 0) + 1;

    // Daily statistics (group by date)
    const date = scan.scanTime.split('T')[0];
    dailyStats[date] = (dailyStats[date] || 0) + 1;
  });

  return {
    totalScans: scans.length,
    uniqueVehicles: Array.from(uniqueVehicles),
    officerStats,
    statusBreakdown,
    dailyStats,
  };
};

// Date range utilities
export const getPredefinedDateRanges = () => ({
  today: {
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  yesterday: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  last7Days: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  last30Days: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  thisMonth: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  lastMonth: {
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0],
  },
});