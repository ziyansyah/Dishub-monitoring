import { PrismaService } from '../database/prisma.service';
export declare class ActivityService {
    private prisma;
    constructor(prisma: PrismaService);
    getLogs(query: any): Promise<{
        data: ({
            user: {
                role: {
                    name: string;
                };
                username: string;
                name: string;
                id: string;
            };
        } & {
            id: string;
            action: string;
            timestamp: Date;
            ipAddress: string | null;
            userAgent: string | null;
            status: string;
            details: string | null;
            userId: string;
        })[];
        pagination: {
            page: any;
            limit: any;
            total: number;
            pages: number;
        };
    }>;
    getRecentLogs(limit?: number): Promise<({
        user: {
            role: {
                name: string;
            };
            username: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        action: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
        status: string;
        details: string | null;
        userId: string;
    })[]>;
    getActivityStats(): Promise<{
        totalActivities: number;
        activitiesToday: number;
        successActivities: number;
        failedActivities: number;
        successRate: number;
        actionDistribution: {
            action: string;
            count: number;
        }[];
        hourlyActivity: any[];
        topUsers: {
            activityCount: number;
            role: {
                name: string;
            };
            username: string;
            name: string;
            id: string;
        }[];
    }>;
    exportToCSV(query: any): Promise<string>;
    logActivity(action: string, userId: string, ipAddress: string, userAgent: string, status: 'success' | 'failed', details?: string): Promise<void>;
    getActionsList(): Promise<string[]>;
    getActivityByUser(userId: string, limit?: number): Promise<({
        user: {
            username: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        action: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
        status: string;
        details: string | null;
        userId: string;
    })[]>;
    getFailedActivities(): Promise<({
        user: {
            username: string;
            name: string;
            id: string;
        };
    } & {
        id: string;
        action: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
        status: string;
        details: string | null;
        userId: string;
    })[]>;
    getSystemActivities(): Promise<{
        id: string;
        action: string;
        timestamp: Date;
        ipAddress: string | null;
        userAgent: string | null;
        status: string;
        details: string | null;
        userId: string;
    }[]>;
    private buildWhereClause;
}
