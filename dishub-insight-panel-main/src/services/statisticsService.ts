import { useQuery } from '@tanstack/react-query';
import { apiService } from './api';
import { VehicleTypeStats, ScanTrend } from '../types/api';

// API functions
const getVehicleTypeStats = async (): Promise<VehicleTypeStats[]> => {
  return apiService.get<VehicleTypeStats[]>('/statistics/vehicle-types');
};

const getTaxStatusStats = async (): Promise<VehicleTypeStats[]> => {
  return apiService.get<VehicleTypeStats[]>('/statistics/tax-status');
};

const getScanTrends = async (period: string = 'month'): Promise<ScanTrend[]> => {
  return apiService.get<ScanTrend[]>('/statistics/scan-trends', { period });
};

const exportStatistics = async (format: 'pdf' | 'excel'): Promise<void> => {
  const filename = `statistics.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  await apiService.downloadFile(`/statistics/export?format=${format}`, filename);
};

// TanStack Query hooks
export const useVehicleTypeStats = () => {
  return useQuery({
    queryKey: ['vehicle-type-stats'],
    queryFn: getVehicleTypeStats,
    staleTime: 30000, // 30 seconds
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

export const useTaxStatusStatsForStatistics = () => {
  return useQuery({
    queryKey: ['tax-status-stats-statistics'],
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

export const useScanTrends = (period: string = 'month') => {
  return useQuery({
    queryKey: ['scan-trends', period],
    queryFn: () => getScanTrends(period),
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

// Export function hook
export const useExportStatistics = () => {
  return {
    exportPDF: async () => {
      await exportStatistics('pdf');
    },
    exportExcel: async () => {
      await exportStatistics('excel');
    },
  };
};

// Hook for getting all statistics data at once
export const useStatisticsData = (period: string = 'month') => {
  const vehicleTypes = useVehicleTypeStats();
  const taxStatus = useTaxStatusStatsForStatistics();
  const scanTrends = useScanTrends(period);

  return {
    vehicleTypes,
    taxStatus,
    scanTrends,
    isLoading: vehicleTypes.isLoading || taxStatus.isLoading || scanTrends.isLoading,
    isError: vehicleTypes.isError || taxStatus.isError || scanTrends.isError,
    error: vehicleTypes.error || taxStatus.error || scanTrends.error,
    lastUpdated: Math.max(
      vehicleTypes.dataUpdatedAt || 0,
      taxStatus.dataUpdatedAt || 0,
      scanTrends.dataUpdatedAt || 0
    ),
  };
};

// Calculate summary statistics from API data
export const calculateSummaryStats = (
  vehicleTypes: VehicleTypeStats[],
  taxStatus: VehicleTypeStats[]
) => {
  const totalVehicles = vehicleTypes.reduce((sum, type) => sum + type.count, 0);
  const compliantVehicles = taxStatus.find(status => status.type === 'lunas')?.count || 0;
  const complianceRate = totalVehicles > 0 ? (compliantVehicles / totalVehicles) * 100 : 0;

  return {
    totalVehicles,
    compliantVehicles,
    complianceRate: complianceRate.toFixed(1),
    mostCommonType: vehicleTypes.reduce((prev, current) =>
      prev.count > current.count ? prev : current, vehicleTypes[0] || { type: 'N/A', count: 0 }
    ).type,
  };
};