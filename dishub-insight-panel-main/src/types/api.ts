// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      role?: string;
    };
  };
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode?: number;
}

// Vehicle types
export interface Vehicle {
  id: string;
  plateNumber: string;
  ownerName: string;
  vehicleType: 'mobil' | 'motor' | 'truk';
  color: string;
  taxStatus: 'lunas' | 'belum-lunas';
  lastScanDate: string;
  location?: string;
}

export interface VehicleSearchParams {
  search?: string;
  vehicleType?: string;
  taxStatus?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface VehicleSearchResponse {
  success: boolean;
  data: {
    vehicles: Vehicle[];
    total: number;
    page: number;
    totalPages: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalVehicles: number;
  activeScans: number;
  taxCompliant: number;
  recentActivity: number;
}

export interface RecentScan {
  id: string;
  plateNumber: string;
  ownerName: string;
  vehicleType: string;
  scanTime: string;
  location: string;
  status: string;
}

export interface WeeklyTrend {
  day: string;
  scans: number;
}

export interface TaxStatusData {
  name: string;
  value: number;
  fill: string;
}

// Statistics types
export interface VehicleTypeStats {
  type: string;
  count: number;
  percentage: number;
}

export interface ScanTrend {
  date: string;
  scans: number;
  newVehicles: number;
}

// Reports types
export interface ScanHistoryItem {
  id: string;
  plateNumber: string;
  ownerName: string;
  vehicleType: string;
  scanTime: string;
  location: string;
  officer: string;
  status: string;
}

export interface ScanHistoryParams {
  startDate?: string;
  endDate?: string;
  officer?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ScanHistoryResponse {
  success: boolean;
  data: {
    scans: ScanHistoryItem[];
    total: number;
    page: number;
    totalPages: number;
  };
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}