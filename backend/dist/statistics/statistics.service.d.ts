import { PrismaService } from '../database/prisma.service';
export declare class StatisticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardStats(): Promise<{
        totalVehicles: number;
        taxActive: number;
        taxInactive: number;
        scansToday: number;
        totalScans: number;
        trends: {
            weekly: any[];
            taxStatus: {
                name: string;
                value: number;
            }[];
            monthly: any[];
        };
        complianceRate: number;
    }>;
    getVehicleTypeDistribution(): Promise<{
        type: string;
        count: number;
        percentage: number;
    }[]>;
    getTaxComplianceStats(): Promise<{
        totalVehicles: number;
        taxActive: number;
        taxExpired: number;
        taxExpiringSoon: number;
        complianceRate: number;
        monthlyTrend: any[];
    }>;
    getWeeklyTrends(): Promise<any[]>;
    getScanActivityHeatmap(): Promise<{
        heatmapData: any[];
        hourlyStats: {
            hour: string;
            count: any;
            percentage: number;
        }[];
        peakHour: {
            hour: string;
            count: any;
            percentage: number;
        };
        totalScans: number;
    }>;
    getLocationStats(): Promise<{
        location: string;
        count: number;
        percentage: number;
    }[]>;
    getUserActivityStats(): Promise<{
        topUsers: {
            id: string;
            username: string;
            name: string;
            role: string;
            scansCount: number;
        }[];
        totalActiveUsers: number;
    }>;
    getExportStats(): Promise<{
        totalReports: number;
        successfulReports: number;
        formatStats: {
            format: string;
            total: number;
            successful: number;
            successRate: number;
        }[];
        recentReports: {
            id: string;
            title: string;
            format: string;
            status: string;
            createdAt: Date;
        }[];
    }>;
}
