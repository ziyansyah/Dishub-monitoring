import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/statistics/dashboard');
      return response.data;
    },
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useRecentScans = (limit: number = 10) => {
  return useQuery({
    queryKey: ['recent-scans', limit],
    queryFn: async () => {
      const response = await api.get(`/scans/recent?limit=${limit}`);
      return response.data;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};