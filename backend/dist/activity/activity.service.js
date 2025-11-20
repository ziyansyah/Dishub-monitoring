"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const date_fns_1 = require("date-fns");
let ActivityService = class ActivityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLogs(query) {
        const { page = 1, limit = 10, search, status, action, userId, startDate, endDate, sortBy = 'timestamp', sortOrder = 'desc', } = query;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { user: { name: { contains: search } } },
                { user: { username: { contains: search } } },
                { action: { contains: search } },
                { ipAddress: { contains: search } },
                { details: { contains: search } },
            ];
        }
        if (status) {
            where.status = status;
        }
        if (action) {
            where.action = action;
        }
        if (userId) {
            where.userId = userId;
        }
        if (startDate || endDate) {
            where.timestamp = {};
            if (startDate) {
                const start = (0, date_fns_1.parseISO)(startDate);
                if ((0, date_fns_1.isValid)(start)) {
                    where.timestamp.gte = start;
                }
            }
            if (endDate) {
                const end = (0, date_fns_1.parseISO)(endDate);
                if ((0, date_fns_1.isValid)(end)) {
                    where.timestamp.lte = end;
                }
            }
        }
        const [logs, total] = await Promise.all([
            this.prisma.activityLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortBy]: sortOrder,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            name: true,
                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.activityLog.count({ where }),
        ]);
        return {
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    }
    async getRecentLogs(limit = 20) {
        return this.prisma.activityLog.findMany({
            take: limit,
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getActivityStats() {
        const now = new Date();
        const todayStart = (0, date_fns_1.startOfDay)(now);
        const todayEnd = (0, date_fns_1.endOfDay)(now);
        const [totalActivities, activitiesToday, successActivities, failedActivities,] = await Promise.all([
            this.prisma.activityLog.count(),
            this.prisma.activityLog.count({
                where: {
                    timestamp: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            }),
            this.prisma.activityLog.count({
                where: { status: 'success' },
            }),
            this.prisma.activityLog.count({
                where: { status: 'failed' },
            }),
        ]);
        const actionStats = await this.prisma.activityLog.groupBy({
            by: ['action'],
            _count: {
                action: true,
            },
            orderBy: {
                _count: {
                    action: 'desc',
                },
            },
            take: 10,
        });
        const hourlyActivity = [];
        for (let hour = 0; hour < 24; hour++) {
            const hourStart = new Date(todayStart);
            hourStart.setHours(hour, 0, 0, 0);
            const hourEnd = new Date(todayStart);
            hourEnd.setHours(hour, 59, 59, 999);
            const hourCount = await this.prisma.activityLog.count({
                where: {
                    timestamp: {
                        gte: hourStart,
                        lte: hourEnd,
                    },
                },
            });
            hourlyActivity.push({
                hour: `${hour.toString().padStart(2, '0')}:00`,
                count: hourCount,
            });
        }
        const topUsers = await this.prisma.activityLog.groupBy({
            by: ['userId'],
            _count: {
                userId: true,
            },
            orderBy: {
                _count: {
                    userId: 'desc',
                },
            },
            take: 10,
        });
        const usersWithDetails = await Promise.all(topUsers.map(async (userStat) => {
            const user = await this.prisma.user.findUnique({
                where: { id: userStat.userId },
                select: {
                    id: true,
                    username: true,
                    name: true,
                    role: {
                        select: {
                            name: true,
                        },
                    },
                },
            });
            return {
                ...user,
                activityCount: userStat._count.userId,
            };
        }));
        return {
            totalActivities,
            activitiesToday,
            successActivities,
            failedActivities,
            successRate: totalActivities > 0 ? Math.round((successActivities / totalActivities) * 100) : 0,
            actionDistribution: actionStats.map(stat => ({
                action: stat.action,
                count: stat._count.action,
            })),
            hourlyActivity,
            topUsers: usersWithDetails.filter(Boolean),
        };
    }
    async exportToCSV(query) {
        const logs = await this.prisma.activityLog.findMany({
            where: this.buildWhereClause(query),
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        username: true,
                        name: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            take: 10000,
        });
        const csvData = logs.map(log => ({
            Timestamp: (0, date_fns_1.format)(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
            User: log.user?.name || 'System',
            Username: log.user?.username || 'system',
            Role: log.user?.role?.name || 'System',
            Action: log.action,
            Status: log.status,
            'IP Address': log.ipAddress || 'N/A',
            'User Agent': log.userAgent || 'N/A',
            Details: log.details || '',
        }));
        const headers = ['Timestamp', 'User', 'Username', 'Role', 'Action', 'Status', 'IP Address', 'User Agent', 'Details'];
        const csvRows = [headers.join(',')];
        csvData.forEach(row => {
            const values = headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });
        return csvRows.join('\n');
    }
    async logActivity(action, userId, ipAddress, userAgent, status, details) {
        try {
            await this.prisma.activityLog.create({
                data: {
                    action,
                    userId,
                    ipAddress,
                    userAgent,
                    status,
                    details,
                },
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    }
    async getActionsList() {
        const actions = await this.prisma.activityLog.groupBy({
            by: ['action'],
            _count: {
                action: true,
            },
            orderBy: {
                action: 'asc',
            },
        });
        return actions.map(action => action.action);
    }
    async getActivityByUser(userId, limit = 50) {
        return this.prisma.activityLog.findMany({
            where: { userId },
            take: limit,
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
        });
    }
    async getFailedActivities() {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return this.prisma.activityLog.findMany({
            where: {
                status: 'failed',
                timestamp: {
                    gte: last24Hours,
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                    },
                },
            },
            take: 50,
        });
    }
    async getSystemActivities() {
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return this.prisma.activityLog.findMany({
            where: {
                userId: 'system',
                timestamp: {
                    gte: last7Days,
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: 100,
        });
    }
    buildWhereClause(query) {
        const where = {};
        if (query.search) {
            where.OR = [
                { user: { name: { contains: query.search } } },
                { user: { username: { contains: query.search } } },
                { action: { contains: query.search } },
                { ipAddress: { contains: query.search } },
                { details: { contains: query.search } },
            ];
        }
        if (query.status) {
            where.status = query.status;
        }
        if (query.action) {
            where.action = query.action;
        }
        if (query.userId) {
            where.userId = query.userId;
        }
        if (query.startDate || query.endDate) {
            where.timestamp = {};
            if (query.startDate) {
                const start = (0, date_fns_1.parseISO)(query.startDate);
                if ((0, date_fns_1.isValid)(start)) {
                    where.timestamp.gte = start;
                }
            }
            if (query.endDate) {
                const end = (0, date_fns_1.parseISO)(query.endDate);
                if ((0, date_fns_1.isValid)(end)) {
                    where.timestamp.lte = end;
                }
            }
        }
        return where;
    }
};
exports.ActivityService = ActivityService;
exports.ActivityService = ActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityService);
//# sourceMappingURL=activity.service.js.map