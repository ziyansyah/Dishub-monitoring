import { Response } from 'express';
import { ActivityService } from './activity.service';
export declare class ActivityController {
    private readonly activityService;
    constructor(activityService: ActivityService);
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
    getStats(): Promise<{
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
    getActionsList(): Promise<string[]>;
    getActivitiesByUser(userId: string, limit?: number): Promise<({
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
    exportToCSV(query: any, res: Response, userAgent: string): Promise<void>;
}
