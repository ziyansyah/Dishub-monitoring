import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface VehicleQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  taxStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useVehicles = (query: VehicleQuery = {}) => {
  return useQuery({
    queryKey: ['vehicles', query],
    queryFn: async () => {
      const response = await api.get('/vehicles', { params: query });
      return response.data;
    },
    keepPreviousData: true,
  });
};

export const useVehicleStats = () => {
  return useQuery({
    queryKey: ['vehicle-stats'],
    queryFn: async () => {
      const response = await api.get('/vehicles/stats');
      return response.data;
    },
  });
};