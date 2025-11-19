import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from './api';
import { Vehicle, VehicleSearchParams, VehicleSearchResponse } from '../types/api';

// API functions
const getVehicles = async (limit?: number): Promise<{ vehicles: Vehicle[]; total: number }> => {
  const params = limit ? { limit } : {};
  return apiService.get<{ vehicles: Vehicle[]; total: number }>('/vehicles', params);
};

const searchVehicles = async (params: VehicleSearchParams): Promise<VehicleSearchResponse> => {
  return apiService.get<VehicleSearchResponse>('/vehicles/search', params);
};

const getVehicleById = async (id: string): Promise<Vehicle> => {
  return apiService.get<Vehicle>(`/vehicles/${id}`);
};

// TanStack Query hooks
export const useVehicles = (limit?: number) => {
  return useQuery({
    queryKey: ['vehicles', limit],
    queryFn: () => getVehicles(limit),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401/403 errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403) return false;
      }
      return failureCount < 3;
    },
    refetchInterval: 60000, // Auto-refresh every 1 minute
  });
};

export const useVehicleSearch = (params: VehicleSearchParams) => {
  return useQuery({
    queryKey: ['vehicle-search', params],
    queryFn: () => searchVehicles(params),
    staleTime: 15000, // 15 seconds for search results
    gcTime: 300000, // 5 minutes
    enabled: Object.keys(params).length > 0 && (params.search?.length || 0) > 0,
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 401 || statusCode === 403 || statusCode === 404) return false;
      }
      return failureCount < 2;
    },
  });
};

export const useVehicleById = (id: string) => {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicleById(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes for individual vehicle data
    gcTime: 600000, // 10 minutes
    retry: (failureCount, error) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode;
        if (statusCode === 404) return false; // Don't retry if vehicle not found
      }
      return failureCount < 2;
    },
  });
};

// Mutations for vehicle operations (if needed in the future)
export const useInvalidateVehicles = () => {
  const queryClient = useQueryClient();

  return {
    invalidateVehicles: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    invalidateVehicleSearch: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-search'] });
    },
    invalidateVehicle: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle', id] });
    },
  };
};

// Debounced search hook for better UX
export const useDebouncedVehicleSearch = (params: VehicleSearchParams, debounceMs: number = 300) => {
  return useQuery({
    queryKey: ['vehicle-search-debounced', params],
    queryFn: () => searchVehicles(params),
    staleTime: 10000, // 10 seconds for debounced results
    gcTime: 300000, // 5 minutes
    enabled: Object.keys(params).length > 0 && (params.search?.length || 0) > 2, // Only search with 3+ chars
    retry: false, // Don't retry debounced searches automatically
    refetchOnWindowFocus: false,
  });
};